// @ts-nocheck
// Preventing TS checks with files presented in the video for a better presentation.
import type { Message } from 'ai';
import React, { type RefCallback } from 'react';
import { IconButton } from '../../components/ui/IconButton';
import { Workbench } from '../workbench/Workbench.client';
import { classNames } from '../../utils/classNames';
import { MODEL_LIST, DEFAULT_PROVIDER } from '../../utils/constants';
import { Messages } from './Messages.client';
import { SendButton } from './SendButton.client';
import { useState, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { workbenchStore } from '../../lib/stores/workbench';

import styles from './BaseChat.module.scss';


const ModelSelector = ({ model, setModel }) => {
  const [provider, setProvider] = useState(DEFAULT_PROVIDER);
  const modelList = MODEL_LIST;
  const providerList = [...new Set(MODEL_LIST.map((model) => model.provider))];

  return (
    <div className="mb-2">
      <label className="block text-sm font-medium text-thor-elements-textPrimary mb-2">
        Choose your divine model
      </label>
      <select
        value={provider}
        onChange={(e) => {
          setProvider(e.target.value);
          const firstModel = [...modelList].find(m => m.provider == e.target.value);
          setModel(firstModel ? firstModel.name : '');
        }}
        className="w-full p-2 rounded-lg border border-thor-elements-borderColor bg-thor-elements-prompt-background text-thor-elements-textPrimary focus:outline-none"
      >
        {providerList.map((provider) => (
          <option key={provider} value={provider}>
            {provider}
          </option>
        ))}
      </select>
      <select
        value={model}
        onChange={(e) => setModel(e.target.value)}
        className="w-full p-2 rounded-lg border border-thor-elements-borderColor bg-thor-elements-prompt-background text-thor-elements-textPrimary focus:outline-none"
      >
        {[...modelList].filter(e => e.provider == provider && e.name).map((modelOption) => (
          <option key={modelOption.name} value={modelOption.name}>
            {modelOption.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const TEXTAREA_MIN_HEIGHT = 76;

interface BaseChatProps {
  textareaRef?: React.RefObject<HTMLTextAreaElement> | undefined;
  messageRef?: RefCallback<HTMLDivElement> | undefined;
  scrollRef?: RefCallback<HTMLDivElement> | undefined;
  showChat?: boolean;
  chatStarted?: boolean;
  isStreaming?: boolean;
  messages?: Message[];
  enhancingPrompt?: boolean;
  promptEnhanced?: boolean;
  input?: string;
  model: string;
  setModel: (model: string) => void;
  handleStop?: () => void;
  sendMessage?: (event: React.UIEvent, messageInput?: string) => void;
  handleInputChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  enhancePrompt?: () => void;
}

export const BaseChat = React.forwardRef<HTMLDivElement, BaseChatProps>(
  (
    {
      textareaRef,
      messageRef,
      scrollRef,
      showChat = true,
      chatStarted = false,
      isStreaming = false,
      enhancingPrompt = false,
      promptEnhanced = false,
      messages,
      input = '',
      model,
      setModel,
      sendMessage,
      handleInputChange,
      enhancePrompt,
      handleStop,
    },
    ref,
  ) => {
    const TEXTAREA_MAX_HEIGHT = 120; // Fixed height for consistent chatbox size
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

    // Check if workbench is open to adjust layout
    const showWorkbench = useStore(workbenchStore.showWorkbench);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      setAttachedFiles(prev => [...prev, ...files]);
    };

    const removeAttachedFile = (index: number) => {
      setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    };

    return (
      <div
        ref={ref}
        className={classNames(
          styles.BaseChat,
          'relative flex h-full overflow-hidden bg-transparent',
          {
            'w-full': !showWorkbench,
            'w-[var(--chat-min-width)]': showWorkbench, // Reserve space for workbench
          }
        )}
        data-chat-visible={showChat}
      >
        <div ref={scrollRef} className="flex overflow-y-auto w-full h-full">
          <div className={classNames(styles.Chat, 'flex flex-col w-full max-w-4xl mx-auto', {
            'h-full': chatStarted,
            'min-h-screen': !chatStarted
          })}>
            {!chatStarted && (
              <div id="intro" className="w-full flex flex-col items-center text-center relative pt-16 pb-8">
                {/* Lightning background effect */}
                <div className="absolute inset-0 -z-10 opacity-20">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-blue-500/30 via-purple-500/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
                </div>
                
                <div className="relative max-w-4xl mx-auto px-8">
                  <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-300 via-purple-400 to-yellow-300 bg-clip-text text-transparent animate-pulse" style={{ fontFamily: 'zentry, sans-serif' }}>
                    Where Thunder Strikes
                  </h1>
                  
                  <p className="mb-8 text-xl text-thor-elements-textSecondary max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: 'robert-regular, sans-serif' }}>
                    Harness the divine power of Thor to forge legendary applications. 
                    <br />
                    <span className="text-blue-400 font-semibold">Command the storm of creativity</span> and bring your visions to life with godlike speed.
                  </p>
                </div>
              </div>
            )}
            <div
              className={classNames('px-6', {
                'h-full flex flex-col pt-6': chatStarted,
                'flex flex-col items-center pt-8': !chatStarted,
              })}
            >
              {chatStarted && (
                <Messages
                  ref={messageRef}
                  className="flex flex-col w-full flex-1 max-w-chat px-4 pb-6 mx-auto z-1"
                  messages={messages}
                  isStreaming={isStreaming}
                />
              )}
              <div
                className={classNames('relative w-full max-w-4xl mx-auto z-prompt', {
                  'sticky bottom-0': chatStarted,
                })}
              >
                <ModelSelector
                  model={model}
                  setModel={setModel}
                />
                <div className="relative bg-thor-elements-prompt-background border border-thor-elements-borderColor rounded-lg overflow-hidden">
                  {/* File Upload Area */}
                  {attachedFiles.length > 0 && (
                    <div className="px-4 pt-2 flex flex-wrap gap-2">
                      {attachedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 bg-thor-elements-background-depth-2 px-2 py-1 rounded-md text-xs">
                          <span className="text-thor-elements-textPrimary">{file.name}</span>
                          <button
                            onClick={() => removeAttachedFile(index)}
                            className="text-thor-elements-textTertiary hover:text-thor-elements-icon-error"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      className={`w-full pl-4 pt-4 pr-16 focus:outline-none resize-none text-md text-thor-elements-textPrimary placeholder-thor-elements-textTertiary bg-transparent`}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          if (event.shiftKey) {
                            return;
                          }

                          event.preventDefault();

                          sendMessage?.(event);
                        }
                      }}
                      value={input}
                      onChange={(event) => {
                        handleInputChange?.(event);
                      }}
                      style={{
                        minHeight: TEXTAREA_MIN_HEIGHT,
                        maxHeight: TEXTAREA_MAX_HEIGHT,
                      }}
                      placeholder="How can Thor help you today?"
                      translate="no"
                    />
                    <SendButton
                      show={input.length > 0 || isStreaming}
                      isStreaming={isStreaming}
                      onClick={(event) => {
                        if (isStreaming) {
                          handleStop?.();
                          return;
                        }

                        sendMessage?.(event);
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-sm p-4 pt-2">
                    <div className="flex gap-1 items-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.txt,.js,.ts,.jsx,.tsx,.html,.css"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <IconButton
                        title="Attach files or images"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-thor-elements-textTertiary hover:text-thor-elements-textPrimary hover:bg-thor-elements-background-depth-2 rounded-md transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                      </IconButton>
                      <IconButton
                        title="Enhance prompt"
                        disabled={input.length === 0 || enhancingPrompt}
                        className={classNames({
                          'opacity-100!': enhancingPrompt,
                          'text-thor-elements-item-contentAccent! pr-1.5 enabled:hover:bg-thor-elements-item-backgroundAccent!':
                            promptEnhanced,
                        })}
                        onClick={() => enhancePrompt?.()}
                      >
                        {enhancingPrompt ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <div className="ml-1.5">Enhancing prompt...</div>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            {promptEnhanced && <div className="ml-1.5">Prompt enhanced</div>}
                          </>
                        )}
                      </IconButton>
                    </div>
                    {input.length > 3 ? (
                      <div className="text-xs text-thor-elements-textTertiary">
                        Use <kbd className="kdb">Shift</kbd> + <kbd className="kdb">Return</kbd> for a new line
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="bg-transparent pb-6">{/* Ghost Element */}</div>
              </div>
            </div>
          </div>
          <Workbench chatStarted={chatStarted} isStreaming={isStreaming} />
        </div>
      </div>
    );
  },
);
