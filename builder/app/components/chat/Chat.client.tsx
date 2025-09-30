// @ts-nocheck
// Preventing TS checks with files presented in the video for a better presentation.
import { useStore } from '@nanostores/react';
import type { Message } from 'ai';
import { useChat } from 'ai/react';
import { useAnimate } from 'framer-motion';
import { memo, useEffect, useRef, useState } from 'react';
import { cssTransition, toast, ToastContainer } from 'react-toastify';
import { useMessageParser, usePromptEnhancer, useShortcuts, useSnapScroll } from '../../lib/hooks';
import { useChatHistory } from '../../lib/persistence';
import { chatStore } from '../../lib/stores/chat';
import { workbenchStore } from '../../lib/stores/workbench';
import { fileModificationsToHTML } from '../../utils/diff';
import { DEFAULT_MODEL } from '../../utils/constants';
import { cubicEasingFn } from '../../utils/easings';
import { createScopedLogger, renderLogger } from '../../utils/logger';
import { BaseChat } from './BaseChat';

const toastAnimation = cssTransition({
  enter: 'animated fadeInRight',
  exit: 'animated fadeOutRight',
});

const logger = createScopedLogger('Chat');

interface ChatProps {
  initialChatId?: string;
}

export function Chat({ initialChatId }: ChatProps = {}) {
  renderLogger.trace('Chat');

  const { ready, initialMessages, storeMessageHistory } = useChatHistory(initialChatId);

  return (
    <>
      {ready && <ChatImpl initialMessages={initialMessages} storeMessageHistory={storeMessageHistory} initialChatId={initialChatId} />}
      <ToastContainer
        closeButton={({ closeToast }) => {
          return (
            <button className="Toastify__close-button" onClick={closeToast}>
              <div className="i-ph:x text-lg" />
            </button>
          );
        }}
        icon={({ type }) => {
          /**
           * @todo Handle more types if we need them. This may require extra color palettes.
           */
          switch (type) {
            case 'success': {
              return <div className="i-ph:check-bold text-thor-elements-icon-success text-2xl" />;
            }
            case 'error': {
              return <div className="i-ph:warning-circle-bold text-thor-elements-icon-error text-2xl" />;
            }
          }

          return undefined;
        }}
        position="bottom-right"
        pauseOnFocusLoss
        transition={toastAnimation}
      />
    </>
  );
}

export const ChatImpl = memo(({ initialMessages = [], storeMessageHistory = async () => {}, initialChatId }: Required<ChatProps>) => {
  useShortcuts();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [chatStarted, setChatStarted] = useState(initialMessages.length > 0);
  const [model, setModel] = useState(DEFAULT_MODEL);

  const { showChat } = useStore(chatStore);

  const [animationScope, animate] = useAnimate();

  // Disable streaming in production for reliability, enable in development
  const isDevelopment = import.meta.env.DEV;
  const enableStreaming = isDevelopment;

  console.log('Chat configuration:', {
    isDevelopment,
    enableStreaming,
    apiUrl: '/api/chat'
  });

  const { messages, isLoading, input, handleInputChange, setInput, stop, append } = useChat({
    api: '/api/chat',
    stream: true, // Enable streaming to match server-side SSE
    headers: {
      'Content-Type': 'application/json',
    },
    onError: (error) => {
      logger.error('Chat request failed:', error);

      // Provide more specific error messages based on error type
      let errorMessage = 'There was an error processing your request';

      if (error?.message?.includes('API key') || error?.message?.includes('401')) {
        errorMessage = '🔑 API key is invalid or expired. Please contact the administrator.';
      } else if (error?.message?.includes('rate limit') || error?.message?.includes('429')) {
        errorMessage = '⚡ Rate limit exceeded! Add $10 credits to OpenRouter to unlock 1000 requests/day, or wait for daily reset.';
      } else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
        errorMessage = '🌐 Network error. Please check your connection and try again.';
      } else if (error?.message?.includes('model') || error?.message?.includes('400')) {
        errorMessage = '🤖 Selected model is not available. Please try another model.';
      } else if (error?.message?.includes('503')) {
        errorMessage = '🔧 AI service is temporarily unavailable. Please try again later.';
      }

      toast.error(errorMessage);
    },
    onFinish: () => {
      logger.debug('Finished response');
    },
    initialMessages,
  });

  const { enhancingPrompt, promptEnhanced, enhancePrompt, resetEnhancer } = usePromptEnhancer();
  const { parsedMessages, parseMessages } = useMessageParser();

  const TEXTAREA_MAX_HEIGHT = chatStarted ? 400 : 200;

  useEffect(() => {
    chatStore.setKey('started', initialMessages.length > 0);
  }, []);

  useEffect(() => {
    parseMessages(messages, isLoading);

    if (messages.length > initialMessages.length) {
      storeMessageHistory(messages).catch((error) => {
        console.error('Failed to store message history:', error);
        toast.error('Failed to save chat history');
      });
    }
  }, [messages, isLoading, parseMessages, storeMessageHistory, initialMessages.length]);

  const scrollTextArea = () => {
    const textarea = textareaRef.current;

    if (textarea) {
      textarea.scrollTop = textarea.scrollHeight;
    }
  };

  const abort = () => {
    stop();
    chatStore.setKey('aborted', true);
    workbenchStore.abortAllActions();
  };

  useEffect(() => {
    const textarea = textareaRef.current;

    if (textarea && input) {
      textarea.style.height = 'auto';

      const scrollHeight = textarea.scrollHeight;

      textarea.style.height = `${Math.min(scrollHeight, TEXTAREA_MAX_HEIGHT)}px`;
      textarea.style.overflowY = scrollHeight > TEXTAREA_MAX_HEIGHT ? 'auto' : 'hidden';
    }
  }, [input]);

  const runAnimation = async () => {
    if (chatStarted) {
      return;
    }

    // Check if elements exist before animating
    const examplesElement = document.getElementById('examples');
    const introElement = document.getElementById('intro');

    const animations = [];

    if (examplesElement) {
      animations.push(animate('#examples', { opacity: 0, display: 'none' }, { duration: 0.1 }));
    }

    if (introElement) {
      animations.push(animate('#intro', { opacity: 0, flex: 1 }, { duration: 0.2, ease: cubicEasingFn }));
    }

    if (animations.length > 0) {
      await Promise.all(animations);
    }

    chatStore.setKey('started', true);
    setChatStarted(true);
  };

  const sendMessage = async (_event: React.UIEvent, messageInput?: string) => {
    const _input = messageInput || input;

    if (_input.length === 0 || isLoading) {
      return;
    }

    /**
     * @note (delm) Usually saving files shouldn't take long but it may take longer if there
     * many unsaved files. In that case we need to block user input and show an indicator
     * of some kind so the user is aware that something is happening. But I consider the
     * happy case to be no unsaved files and I would expect users to save their changes
     * before they send another message.
     */
    await workbenchStore.saveAllFiles();

    const fileModifications = workbenchStore.getFileModifcations();

    chatStore.setKey('aborted', false);

    runAnimation();

    if (fileModifications !== undefined) {
      const diff = fileModificationsToHTML(fileModifications);

      /**
       * If we have file modifications we append a new user message manually since we have to prefix
       * the user input with the file modifications and we don't want the new user input to appear
       * in the prompt. Using `append` is almost the same as `handleSubmit` except that we have to
       * manually reset the input and we'd have to manually pass in file attachments. However, those
       * aren't relevant here.
       */
      append({ role: 'user', content: `[Model: ${model}]\n\n${diff}\n\n${_input}` });

      /**
       * After sending a new message we reset all modifications since the model
       * should now be aware of all the changes.
       */
      workbenchStore.resetAllFileModifications();
    } else {
      append({ role: 'user', content: `[Model: ${model}]\n\n${_input}` });
    }

    setInput('');

    resetEnhancer();

    textareaRef.current?.blur();
  };

  const [messageRef, scrollRef] = useSnapScroll();

  return (
    <BaseChat
      ref={animationScope}
      textareaRef={textareaRef}
      input={input}
      showChat={showChat}
      chatStarted={chatStarted}
      isStreaming={isLoading}
      enhancingPrompt={enhancingPrompt}
      promptEnhanced={promptEnhanced}
      sendMessage={sendMessage}
      model={model}
      setModel={setModel}
      messageRef={messageRef}
      scrollRef={scrollRef}
      handleInputChange={handleInputChange}
      handleStop={abort}
      messages={messages.map((message, i) => {
        if (message.role === 'user') {
          return message;
        }

        return {
          ...message,
          content: parsedMessages[i] || '',
        };
      })}
      enhancePrompt={() => {
        enhancePrompt(input, (input) => {
          setInput(input);
          scrollTextArea();
        });
      }}
    />
  );
});
