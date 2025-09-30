import { WebContainer } from '@webcontainer/api';
import { map, type MapStore } from 'nanostores';
import type { ThorAction } from '../../types/actions';
import { createScopedLogger } from '../../utils/logger';
import { WORK_DIR } from '../../utils/constants';
import { unreachable } from '../../utils/unreachable';
import type { ActionCallbackData } from './message-parser';

const logger = createScopedLogger('ActionRunner');

export type ActionStatus = 'pending' | 'running' | 'complete' | 'aborted' | 'failed';

export type BaseActionState = ThorAction & {
  status: Exclude<ActionStatus, 'failed'>;
  abort: () => void;
  executed: boolean;
  abortSignal: AbortSignal;
};

export type FailedActionState = ThorAction &
  Omit<BaseActionState, 'status'> & {
    status: Extract<ActionStatus, 'failed'>;
    error: string;
  };

export type ActionState = BaseActionState | FailedActionState;

type BaseActionUpdate = Partial<Pick<BaseActionState, 'status' | 'abort' | 'executed'>>;

export type ActionStateUpdate =
  | BaseActionUpdate
  | (Omit<BaseActionUpdate, 'status'> & { status: 'failed'; error: string });

type ActionsMap = MapStore<Record<string, ActionState>>;

export class ActionRunner {
  #webcontainer: Promise<WebContainer>;
  #currentExecutionPromise: Promise<void> = Promise.resolve();

  actions: ActionsMap = map({});

  constructor(webcontainerPromise: Promise<WebContainer>) {
    this.#webcontainer = webcontainerPromise;
  }

  addAction(data: ActionCallbackData) {
    const { actionId } = data;

    const actions = this.actions.get();
    const action = actions[actionId];

    if (action) {
      // action already added
      return;
    }

    const abortController = new AbortController();

    this.actions.setKey(actionId, {
      ...data.action,
      status: 'pending',
      executed: false,
      abort: () => {
        abortController.abort();
        this.#updateAction(actionId, { status: 'aborted' });
      },
      abortSignal: abortController.signal,
    });

    this.#currentExecutionPromise.then(() => {
      this.#updateAction(actionId, { status: 'running' });
    });
  }

  async runAction(data: ActionCallbackData) {
    const { actionId } = data;
    const action = this.actions.get()[actionId];

    if (!action) {
      unreachable(`Action ${actionId} not found`);
    }

    if (action.executed) {
      return;
    }

    this.#updateAction(actionId, { ...action, ...data.action, executed: true });

    this.#currentExecutionPromise = this.#currentExecutionPromise
      .then(() => {
        return this.#executeAction(actionId);
      })
      .catch((error) => {
        console.error('Action failed:', error);
      });
  }

  async #executeAction(actionId: string) {
    const action = this.actions.get()[actionId];

    this.#updateAction(actionId, { status: 'running' });

    try {
      switch (action.type) {
        case 'shell': {
          await this.#runShellAction(action);
          break;
        }
        case 'file': {
          await this.#runFileAction(action);
          break;
        }
      }

      this.#updateAction(actionId, { status: action.abortSignal.aborted ? 'aborted' : 'complete' });
    } catch (error) {
      this.#updateAction(actionId, { status: 'failed', error: 'Action failed' });

      // re-throw the error to be caught in the promise chain
      throw error;
    }
  }

  async #runShellAction(action: ActionState) {
    if (action.type !== 'shell') {
      unreachable('Expected shell action');
    }

    const webcontainer = await this.#webcontainer;

    const process = await webcontainer.spawn('jsh', ['-c', action.content], {
      env: { npm_config_yes: true },
    });

    action.abortSignal.addEventListener('abort', () => {
      process.kill();
    });

    process.output.pipeTo(
      new WritableStream({
        write(data) {
          console.log(data);
        },
      }),
    );

    const exitCode = await process.exit;

    logger.debug(`Process terminated with code ${exitCode}`);
  }

  async #runFileAction(action: ActionState) {
    if (action.type !== 'file') {
      unreachable('Expected file action');
    }

    const webcontainer = await this.#webcontainer;

    // Ensure WebContainer is ready
    try {
      await webcontainer.fs.readdir('/');
      logger.debug('WebContainer file system is ready');
    } catch (error) {
      logger.error('WebContainer file system not ready:', error);
      throw new Error('WebContainer file system is not initialized');
    }

    // Add retry logic for file operations
    const maxRetries = 5;
    let lastError: Error | null = null;

    // Normalize file path to ensure files are created under WORK_DIR
    const normalizePath = (path: string) => {
      if (!path) return `${WORK_DIR}/unknown-file`;

      // Ensure leading slash
      const withLeadingSlash = path.startsWith('/') ? path : `/${path}`;

      // If already under WORK_DIR, return as-is
      if (withLeadingSlash.startsWith(WORK_DIR)) {
        return withLeadingSlash;
      }

      // Otherwise, place under WORK_DIR
      return `${WORK_DIR}${withLeadingSlash}`;
    };

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const targetPath = normalizePath(action.filePath);
        logger.debug(`File creation attempt ${attempt} for: ${targetPath}`);

        // Simple dirname function for WebContainer environment
        let folder = targetPath.substring(0, targetPath.lastIndexOf('/'));
        folder = folder.replace(/\/+$/g, '');

        logger.debug(`Creating folder: ${folder}`);

        if (folder !== '.') {
          try {
            await webcontainer.fs.mkdir(folder, { recursive: true });
            logger.debug('Created folder', folder);
          } catch (error) {
            logger.error('Failed to create folder\n\n', error);
            // Continue anyway, the writeFile might still work
          }
        }

        // Ensure parent directory exists by checking
        try {
          await webcontainer.fs.readdir(folder === '.' ? '/' : folder);
        } catch (error) {
          logger.debug('Parent directory does not exist, creating it');
          await webcontainer.fs.mkdir(folder, { recursive: true });
        }

        logger.debug(`Writing file: ${targetPath}, content length: ${action.content.length}`);
        await webcontainer.fs.writeFile(targetPath, action.content, { encoding: 'utf-8' });
        logger.debug(`File written successfully: ${targetPath}`);

        return; // Success, exit the retry loop

      } catch (error) {
        lastError = error as Error;
        logger.error(`File operation attempt ${attempt} failed:`, error);

        if (attempt < maxRetries) {
          const delay = 500 * attempt; // Progressive delay
          logger.debug(`Waiting ${delay}ms before retry`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // If we get here, all retries failed
    logger.error('All file operation attempts failed:', lastError);
    throw lastError || new Error('File operation failed after retries');
  }

  #updateAction(id: string, newState: ActionStateUpdate) {
    const actions = this.actions.get();

    this.actions.setKey(id, { ...actions[id], ...newState });
  }
}
