import type { ActionType, ThorAction, ThorActionData, FileAction, ShellAction } from '../../types/actions';
import type { ThorArtifactData } from '../../types/artifact';
import { createScopedLogger } from '../../utils/logger';
import { unreachable } from '../../utils/unreachable';

const ARTIFACT_TAG_OPEN = '<thorArtifact';
const ARTIFACT_TAG_CLOSE = '</thorArtifact>';
const ARTIFACT_ACTION_TAG_OPEN = '<thorAction';
const ARTIFACT_ACTION_TAG_CLOSE = '</thorAction>';

// Also handle the actual format that Gemini generates
const ARTIFACT_DIV_OPEN = '<div class="__thorArtifact__"';
const ARTIFACT_DIV_CLOSE = '</div>';

const logger = createScopedLogger('MessageParser');

export interface ArtifactCallbackData extends ThorArtifactData {
  messageId: string;
}

export interface ActionCallbackData {
  artifactId: string;
  messageId: string;
  actionId: string;
  action: ThorAction;
}

export type ArtifactCallback = (data: ArtifactCallbackData) => void;
export type ActionCallback = (data: ActionCallbackData) => void;

export interface ParserCallbacks {
  onArtifactOpen?: ArtifactCallback;
  onArtifactClose?: ArtifactCallback;
  onActionOpen?: ActionCallback;
  onActionClose?: ActionCallback;
}

interface ElementFactoryProps {
  messageId: string;
}

type ElementFactory = (props: ElementFactoryProps) => string;

export interface StreamingMessageParserOptions {
  callbacks?: ParserCallbacks;
  artifactElement?: ElementFactory;
}

interface MessageState {
  position: number;
  insideArtifact: boolean;
  insideAction: boolean;
  currentArtifact?: ThorArtifactData;
  currentAction: ThorActionData;
  actionId: number;
}

export class StreamingMessageParser {
  #messages = new Map<string, MessageState>();

  constructor(private _options: StreamingMessageParserOptions = {}) {}

  parse(messageId: string, input: string) {
    let state = this.#messages.get(messageId);

    if (!state) {
      state = {
        position: 0,
        insideAction: false,
        insideArtifact: false,
        currentAction: { content: '' },
        actionId: 0,
      };

      this.#messages.set(messageId, state);
    }

    let output = '';
    let i = state.position;
    let earlyBreak = false;

    while (i < input.length) {
      if (state.insideArtifact) {
        const currentArtifact = state.currentArtifact;

        if (currentArtifact === undefined) {
          unreachable('Artifact not initialized');
        }

        if (state.insideAction) {
          const closeIndex = input.indexOf(ARTIFACT_ACTION_TAG_CLOSE, i);

          const currentAction = state.currentAction;

          if (closeIndex !== -1) {
            currentAction.content += input.slice(i, closeIndex);

            let content = currentAction.content.trim();

            if ('type' in currentAction && currentAction.type === 'file') {
              content += '\n';
            }

            currentAction.content = content;

            this._options.callbacks?.onActionClose?.({
              artifactId: currentArtifact.id,
              messageId,

              /**
               * We decrement the id because it's been incremented already
               * when `onActionOpen` was emitted to make sure the ids are
               * the same.
               */
              actionId: String(state.actionId - 1),

              action: currentAction as ThorAction,
            });

            state.insideAction = false;
            state.currentAction = { content: '' };

            i = closeIndex + ARTIFACT_ACTION_TAG_CLOSE.length;
          } else {
            break;
          }
        } else {
          const actionOpenIndex = input.indexOf(ARTIFACT_ACTION_TAG_OPEN, i);
          const artifactCloseIndex = input.indexOf(ARTIFACT_TAG_CLOSE, i);
          const divArtifactCloseIndex = input.indexOf(ARTIFACT_DIV_CLOSE, i);

          // Use the closest closing tag
          const closestArtifactClose = artifactCloseIndex !== -1 && (divArtifactCloseIndex === -1 || artifactCloseIndex < divArtifactCloseIndex)
            ? artifactCloseIndex
            : divArtifactCloseIndex;

          if (actionOpenIndex !== -1 && (closestArtifactClose === -1 || actionOpenIndex < closestArtifactClose)) {
            const actionEndIndex = input.indexOf('>', actionOpenIndex);

            if (actionEndIndex !== -1) {
              state.insideAction = true;

              state.currentAction = this.#parseActionTag(input, actionOpenIndex, actionEndIndex);

              this._options.callbacks?.onActionOpen?.({
                artifactId: currentArtifact.id,
                messageId,
                actionId: String(state.actionId++),
                action: state.currentAction as ThorAction,
              });

              i = actionEndIndex + 1;
            } else {
              break;
            }
          } else if (closestArtifactClose !== -1) {
            this._options.callbacks?.onArtifactClose?.({ messageId, ...currentArtifact });

            state.insideArtifact = false;
            state.currentArtifact = undefined;

            // Use the correct close tag length based on which format was used
            const closeTagLength = closestArtifactClose === artifactCloseIndex
              ? ARTIFACT_TAG_CLOSE.length
              : ARTIFACT_DIV_CLOSE.length;

            i = closestArtifactClose + closeTagLength;
          } else {
            break;
          }
        }
      } else if (input[i] === '<' && input[i + 1] !== '/') {
        let j = i;
        let potentialTag = '';

        // Check for both thorArtifact format and div __thorArtifact__ format
        const isThorArtifact = input.slice(i, i + ARTIFACT_TAG_OPEN.length) === ARTIFACT_TAG_OPEN;
        const isDivArtifact = input.slice(i, i + ARTIFACT_DIV_OPEN.length) === ARTIFACT_DIV_OPEN;

        if (isThorArtifact || isDivArtifact) {
          const tagOpen = isThorArtifact ? ARTIFACT_TAG_OPEN : ARTIFACT_DIV_OPEN;
          const tagClose = isThorArtifact ? ARTIFACT_TAG_CLOSE : ARTIFACT_DIV_CLOSE;

          const nextChar = input[j + tagOpen.length];

          if (nextChar && nextChar !== '>' && nextChar !== ' ') {
            output += input.slice(i, j + tagOpen.length);
            i = j + tagOpen.length;
          } else {
            const openTagEnd = input.indexOf('>', j);

            if (openTagEnd !== -1) {
              const artifactTag = input.slice(i, openTagEnd + 1);

              // Extract attributes from the tag
              const artifactTitle = this.#extractAttribute(artifactTag, 'title') ||
                                  this.#extractAttribute(artifactTag, 'data-title') ||
                                  this.#extractDataAttribute(artifactTag, 'title') as string;
              const artifactId = this.#extractAttribute(artifactTag, 'id') ||
                                this.#extractAttribute(artifactTag, 'data-id') ||
                                this.#extractDataAttribute(artifactTag, 'id') as string;

              if (!artifactTitle) {
                logger.warn('Artifact title missing, using default title');
              }

              if (!artifactId) {
                logger.warn('Artifact id missing');
              }

              state.insideArtifact = true;

              const currentArtifact = {
                id: artifactId || 'default-id',
                title: artifactTitle || 'New Project',
              } satisfies ThorArtifactData;

              state.currentArtifact = currentArtifact;

              this._options.callbacks?.onArtifactOpen?.({ messageId, ...currentArtifact });

              const artifactFactory = this._options.artifactElement ?? createArtifactElement;

              output += artifactFactory({ messageId });

              i = openTagEnd + 1;
            } else {
              earlyBreak = true;
            }
          }
        } else {
          // Check if it's a regular HTML tag or other content
          while (j < input.length && input[j] !== '>') {
            potentialTag += input[j];
            j++;
          }

          if (j < input.length) {
            output += input.slice(i, j + 1);
            i = j + 1;
          } else {
            output += input.slice(i);
            i = input.length;
          }
        }
      } else {
        output += input[i];
        i++;
      }

      if (earlyBreak) {
        break;
      }
    }

    state.position = i;

    return output;
  }

  reset() {
    this.#messages.clear();
  }

  #parseActionTag(input: string, actionOpenIndex: number, actionEndIndex: number) {
    const actionTag = input.slice(actionOpenIndex, actionEndIndex + 1);

    const actionType = this.#extractAttribute(actionTag, 'type') as ActionType;

    const actionAttributes = {
      type: actionType,
      content: '',
    };

    if (actionType === 'file') {
      const filePath = this.#extractAttribute(actionTag, 'filePath') as string;

      if (!filePath) {
        logger.debug('File path not specified');
      }

      (actionAttributes as FileAction).filePath = filePath;
    } else if (actionType !== 'shell') {
      logger.warn(`Unknown action type '${actionType}'`);
    }

    return actionAttributes as FileAction | ShellAction;
  }

  #extractAttribute(tag: string, attributeName: string): string | undefined {
    const match = tag.match(new RegExp(`${attributeName}="([^"]*)"`, 'i'));
    return match ? match[1] : undefined;
  }

  #extractDataAttribute(tag: string, attributeName: string): string | undefined {
    const match = tag.match(new RegExp(`data-${attributeName}="([^"]*)"`, 'i'));
    return match ? match[1] : undefined;
  }
}

const createArtifactElement: ElementFactory = (props) => {
  const elementProps = [
    'class="__thorArtifact__"',
    ...Object.entries(props).map(([key, value]) => {
      return `data-${camelToDashCase(key)}=${JSON.stringify(value)}`;
    }),
  ];

  return `<div ${elementProps.join(' ')}></div>`;
};

function camelToDashCase(input: string) {
  return input.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}
