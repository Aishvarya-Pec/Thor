import { useStore } from '@nanostores/react';
import { motion, type HTMLMotionProps, type Variants } from 'framer-motion';
import { computed } from 'nanostores';
import { memo, useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  type OnChangeCallback as OnEditorChange,
  type OnScrollCallback as OnEditorScroll,
} from '../editor/codemirror/CodeMirrorEditor';
import { IconButton } from '../ui/IconButton';
import { PanelHeaderButton } from '../ui/PanelHeaderButton';
import { Slider, type SliderOptions } from '../ui/Slider';
import { workbenchStore, type WorkbenchViewType } from '../../lib/stores/workbench';
import { webcontainerContext } from '../../lib/webcontainer';
import { classNames } from '../../utils/classNames';
import { cubicEasingFn } from '../../utils/easings';
import { renderLogger } from '../../utils/logger';
import { EditorPanel } from './EditorPanel';
import { Preview } from './Preview';

interface WorkspaceProps {
  chatStarted?: boolean;
  isStreaming?: boolean;
}

const viewTransition = { ease: cubicEasingFn };

const sliderOptions: SliderOptions<WorkbenchViewType> = {
  left: {
    value: 'code',
    text: 'Code',
  },
  right: {
    value: 'preview',
    text: 'Preview',
  },
};

const workbenchVariants = {
  closed: {
    width: 0,
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
  open: {
    width: 'var(--workbench-width)',
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
} satisfies Variants;

export const Workbench = memo(({ chatStarted, isStreaming }: WorkspaceProps) => {
  renderLogger.trace('Workbench');

  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const hasPreview = useStore(computed(workbenchStore.previews, (previews) => previews.length > 0));
  const showWorkbench = useStore(workbenchStore.showWorkbench);
  const selectedFile = useStore(workbenchStore.selectedFile);
  const currentDocument = useStore(workbenchStore.currentDocument);
  const unsavedFiles = useStore(workbenchStore.unsavedFiles);
  const files = useStore(workbenchStore.files);
  const selectedView = useStore(workbenchStore.currentView);

  // Set loading to false after a short delay to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Also set loading to false when WebContainer context is ready
  useEffect(() => {
    if (webcontainerContext.loaded) {
      setIsLoading(false);
    }
  }, [webcontainerContext.loaded]);

  const setSelectedView = (view: WorkbenchViewType) => {
    workbenchStore.currentView.set(view);
  };

  useEffect(() => {
    // Default to code view when workbench opens, or preview if files exist
    if (showWorkbench) {
      if (hasPreview) {
        setSelectedView('preview');
      } else {
        setSelectedView('code');
      }
    }
  }, [showWorkbench, hasPreview]);

  useEffect(() => {
    workbenchStore.setDocuments(files);
  }, [files]);

  const onEditorChange = useCallback<OnEditorChange>((update) => {
    workbenchStore.setCurrentDocumentContent(update.content);
  }, []);

  const onEditorScroll = useCallback<OnEditorScroll>((position) => {
    workbenchStore.setCurrentDocumentScrollPosition(position);
  }, []);

  const onFileSelect = useCallback((filePath: string | undefined) => {
    workbenchStore.setSelectedFile(filePath);
  }, []);

  const onFileSave = useCallback(() => {
    workbenchStore.saveCurrentDocument().catch(() => {
      toast.error('Failed to update file content');
    });
  }, []);

  const onFileReset = useCallback(() => {
    workbenchStore.resetCurrentDocument();
  }, []);

  const handleSyncFiles = useCallback(async () => {
    setIsSyncing(true);

    try {
      const directoryHandle = await window.showDirectoryPicker();
      await workbenchStore.syncFiles(directoryHandle);
      toast.success('Files synced successfully');
    } catch (error) {
      console.error('Error syncing files:', error);
      toast.error('Failed to sync files');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return (
    chatStarted && (
      <motion.div
        initial="closed"
        animate={showWorkbench ? 'open' : 'closed'}
        variants={workbenchVariants}
        className="z-workbench"
      >
        {isLoading && (
          <div className="fixed top-[calc(var(--header-height)+1.5rem)] bottom-6 w-[var(--workbench-inner-width)] mr-4 z-10 flex items-center justify-center bg-thor-elements-background-depth-2 border border-thor-elements-borderColor shadow-lg rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
              <p className="text-sm text-thor-elements-textSecondary">Loading IDE...</p>
            </div>
          </div>
        )}
        <div
          className={classNames(
            'fixed top-[calc(var(--header-height)+1.5rem)] bottom-6 w-[var(--workbench-inner-width)] mr-4 z-10 transition-[left,width] duration-200 thor-ease-cubic-bezier',
            {
              'left-[var(--workbench-left)]': showWorkbench,
              'left-[100%]': !showWorkbench,
            },
          )}
        >
          <div className="absolute inset-0 px-6">
            <div className="h-full flex flex-col thor-card thor-glow thunder-border overflow-hidden">
              {/* Header with controls - always visible */}
              <div className="flex items-center px-3 py-2 asgard-header">
                <Slider selected={selectedView} options={sliderOptions} setSelected={setSelectedView} />
                <div className="ml-auto" />
                {selectedView === 'code' && (
                  <>
                    <PanelHeaderButton
                      className="mr-1 text-sm"
                      onClick={() => {
                        workbenchStore.downloadZip();
                      }}
                    >
                      <div className="text-sm">💾</div>
                      Download Code
                    </PanelHeaderButton>
                    <PanelHeaderButton className="mr-1 text-sm" onClick={handleSyncFiles} disabled={isSyncing}>
                      {isSyncing ? <div className="text-sm">⟳</div> : <div className="text-sm">📥</div>}
                      {isSyncing ? 'Syncing...' : 'Sync Files'}
                    </PanelHeaderButton>
                    <PanelHeaderButton
                      className="mr-1 text-sm"
                      onClick={() => {
                        workbenchStore.toggleTerminal(!workbenchStore.showTerminal.get());
                      }}
                    >
                      <div className="text-sm">🖥️</div>
                      Toggle Terminal
                    </PanelHeaderButton>
                    <PanelHeaderButton
                      className="mr-1 text-sm"
                      onClick={() => {
                        const repoName = prompt("Please enter a name for your new GitHub repository:", "thor-generated-project");
                        if (!repoName) {
                          alert("Repository name is required. Push to GitHub cancelled.");
                          return;
                        }
                        const githubUsername = prompt("Please enter your GitHub username:");
                        if (!githubUsername) {
                          alert("GitHub username is required. Push to GitHub cancelled.");
                          return;
                        }
                        const githubToken = prompt("Please enter your GitHub personal access token:");
                        if (!githubToken) {
                          alert("GitHub token is required. Push to GitHub cancelled.");
                          return;
                        }

                      workbenchStore.pushToGitHub(repoName, githubUsername, githubToken);
                      }}
                    >
                      <div className="text-sm">📤</div>
                      Push to GitHub
                    </PanelHeaderButton>
                  </>
                )}
              </div>

              {/* Close button - always visible */}
              <div className="absolute top-2 right-2 z-50">
                <IconButton
                  className="bg-thor-elements-background-depth-2 hover:bg-thor-elements-background-depth-3 text-thor-elements-textPrimary shadow-lg"
                  size="xl"
                  onClick={() => {
                    workbenchStore.showWorkbench.set(false);
                  }}
                >
                  <div className="text-lg">✕</div>
                </IconButton>
              </div>
              <div className="relative flex-1 overflow-hidden">
                {/* Code Editor View */}
                <View
                  initial={{ x: selectedView === 'code' ? 0 : '-100%' }}
                  animate={{ x: selectedView === 'code' ? 0 : '-100%' }}
                >
                  <EditorPanel
                    editorDocument={currentDocument}
                    isStreaming={isStreaming}
                    selectedFile={selectedFile}
                    files={files}
                    unsavedFiles={unsavedFiles}
                    onFileSelect={onFileSelect}
                    onEditorScroll={onEditorScroll}
                    onEditorChange={onEditorChange}
                    onFileSave={onFileSave}
                    onFileReset={onFileReset}
                  />
                </View>

                {/* Preview View */}
                <View
                  initial={{ x: selectedView === 'preview' ? 0 : '100%' }}
                  animate={{ x: selectedView === 'preview' ? 0 : '100%' }}
                >
                  <Preview />
                </View>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  );
});
interface ViewProps extends HTMLMotionProps<'div'> {
  children: JSX.Element;
}

const View = memo(({ children, ...props }: ViewProps) => {
  return (
    <motion.div className="absolute inset-0" transition={viewTransition} {...props}>
      {children}
    </motion.div>
  );
});
