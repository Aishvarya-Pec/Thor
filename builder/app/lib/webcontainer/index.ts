import { WebContainer } from '@webcontainer/api';
import { WORK_DIR_NAME, WORK_DIR } from '../../utils/constants';

interface WebContainerContext {
  loaded: boolean;
}

export const webcontainerContext: WebContainerContext = import.meta.hot?.data.webcontainerContext ?? {
  loaded: false,
};

if (import.meta.hot) {
  import.meta.hot.data.webcontainerContext = webcontainerContext;
}

export let webcontainer: Promise<WebContainer> = new Promise(() => {
  // noop for ssr
});

if (!import.meta.env.SSR) {
  webcontainer =
    import.meta.hot?.data.webcontainer ??
    Promise.resolve()
      .then(async () => {
        try {
          // Check if we're in production/Cloudflare environment
          const isProduction = import.meta.env.PROD || window.location.hostname.includes('pages.dev');

          if (isProduction) {
            console.log('Production environment detected, using simplified mode');

            // In production, return a minimal mock container immediately
            webcontainerContext.loaded = true;
            return {
              fs: {
                writeFile: async (path: string, content: string) => {
                  console.log('Production FS: Writing file', path);
                  // Store in localStorage as fallback
                  try {
                    const files = JSON.parse(localStorage.getItem('thor_files') || '{}');
                    files[path] = content;
                    localStorage.setItem('thor_files', JSON.stringify(files));
                  } catch (error) {
                    console.warn('Failed to store file in localStorage:', error);
                  }
                  return Promise.resolve();
                },
                readFile: async (path: string) => {
                  console.log('Production FS: Reading file', path);
                  try {
                    const files = JSON.parse(localStorage.getItem('thor_files') || '{}');
                    return files[path] || '';
                  } catch (error) {
                    console.warn('Failed to read file from localStorage:', error);
                    return '';
                  }
                },
                readdir: async (path: string) => {
                  console.log('Production FS: Reading directory', path);
                  try {
                    const files = JSON.parse(localStorage.getItem('thor_files') || '{}');
                    return Object.keys(files).filter(key => key.startsWith(path)).map(key => ({
                      name: key.replace(path, '').split('/')[0],
                      type: 'file'
                    }));
                  } catch (error) {
                    console.warn('Failed to read directory from localStorage:', error);
                    return [];
                  }
                },
                mkdir: async (path: string) => {
                  console.log('Production FS: Creating directory', path);
                  return Promise.resolve();
                },
              },
              spawn: async (command: string, args: string[]) => {
                console.log('Production spawn:', command, args);
                // For production, we'll handle commands differently
                return {
                  exit: Promise.resolve(0),
                  output: new WritableStream({
                    write(data) {
                      console.log('Production output:', data);
                    }
                  })
                };
              },
            };
          }

          // Development environment - try WebContainer
          console.log('Development environment detected, initializing WebContainer...');

          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('WebContainer boot timeout')), 15000);
          });

          const bootPromise = WebContainer.boot({ workdirName: WORK_DIR_NAME });
          const container = await Promise.race([bootPromise, timeoutPromise]) as any;

          webcontainerContext.loaded = true;
          console.log('WebContainer initialized successfully');

          return container;
        } catch (error) {
          console.warn('WebContainer failed, using production fallback mode:', error);
          webcontainerContext.loaded = false;

          // Fallback mock container
          return {
            fs: {
              writeFile: async (path: string, content: string) => {
                console.log('Fallback FS: Writing file', path);
                return Promise.resolve();
              },
              readFile: async (path: string) => {
                console.log('Fallback FS: Reading file', path);
                return '';
              },
              readdir: async (path: string) => {
                console.log('Fallback FS: Reading directory', path);
                return [];
              },
              mkdir: async (path: string) => {
                console.log('Fallback FS: Creating directory', path);
                return Promise.resolve();
              },
            },
            spawn: async (command: string, args: string[]) => {
              console.log('Fallback spawn:', command, args);
              return {
                exit: Promise.resolve(0),
                output: new WritableStream({
                  write(data) {
                    console.log('Fallback output:', data);
                  }
                })
              };
            },
          };
        }
      });

  if (import.meta.hot) {
    import.meta.hot.data.webcontainer = webcontainer;
  }
}
