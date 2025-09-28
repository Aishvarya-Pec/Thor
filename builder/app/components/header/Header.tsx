import { useStore } from '@nanostores/react';
import { chatStore } from '../../lib/stores/chat';
import { workbenchStore } from '../../lib/stores/workbench';
import { IconButton } from '../ui/IconButton';

export function Header() {
  const { showSidebar } = useStore(chatStore);

  const toggleSidebar = () => {
    chatStore.setKey('showSidebar', !showSidebar);
  };

  return (
    <header className="sticky top-0 z-[100] flex items-center justify-between p-5 h-[var(--header-height)] bg-transparent border-b border-transparent">
      <div className="flex items-center gap-4 text-thor-elements-textPrimary">
        <IconButton
          onClick={toggleSidebar}
          title="Toggle Sidebar"
          className="mr-2"
        >
          <div className="text-lg">☰</div>
        </IconButton>
        <a href="http://localhost:3000" className="text-2xl font-semibold text-accent flex items-center hover:opacity-80 transition-opacity mjolnir-effect">
          <img src="/videos/img/thorlogo.png" alt="Thor Logo" className="w-[46px] h-auto inline-block" />
          <span className="ml-3 text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-yellow-400 bg-clip-text text-transparent font-zentry tracking-wider thor-text thor-runes">
            THOR
          </span>
        </a>
      </div>
      <div className="flex items-center gap-3">
        <button
          className="p-2 text-thor-elements-textPrimary hover:text-blue-400 rounded-lg transition-all duration-300"
          title="Open IDE"
          onClick={() => {
            // Toggle workbench visibility
            const showWorkbench = !workbenchStore.showWorkbench.get();
            workbenchStore.showWorkbench.set(showWorkbench);
          }}
        >
          <div className="text-lg">💻</div>
        </button>
        <a
          href="/"
          className="p-2 text-thor-elements-textPrimary hover:text-blue-400 hover:bg-thor-elements-background-depth-2 rounded-lg transition-all duration-300"
          title="Go to Landing Page"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </a>
      </div>
    </header>
  );
}
