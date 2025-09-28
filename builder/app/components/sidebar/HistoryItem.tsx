import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from '@remix-run/react';
import { type ChatHistoryItem } from '../../lib/persistence';

interface HistoryItemProps {
  item: ChatHistoryItem;
  onDelete?: (event: React.UIEvent) => void;
}

export function HistoryItem({ item, onDelete }: HistoryItemProps) {
  const [hovering, setHovering] = useState(false);
  const hoverRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined;

    function mouseEnter() {
      setHovering(true);

      if (timeout) {
        clearTimeout(timeout);
      }
    }

    function mouseLeave() {
      setHovering(false);
    }

    hoverRef.current?.addEventListener('mouseenter', mouseEnter);
    hoverRef.current?.addEventListener('mouseleave', mouseLeave);

    return () => {
      hoverRef.current?.removeEventListener('mouseenter', mouseEnter);
      hoverRef.current?.removeEventListener('mouseleave', mouseLeave);
    };
  }, []);

  return (
    <div
      ref={hoverRef}
      className="group rounded-xl text-thor-elements-textSecondary hover:text-thor-elements-textPrimary hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 overflow-hidden flex justify-between items-center px-3 py-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border border-transparent hover:border-blue-500/20 relative"
    >
      {/* Background effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>

      {/* Main chat item */}
      <div className="flex items-center gap-3 w-full relative z-10">
        {/* Chat icon */}
        <button
          onClick={() => {
            window.location.href = `/?builder=true&chatId=${item.urlId}`;
          }}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300 flex-shrink-0"
          title="Open chat"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Chat description */}
        <div
          className="flex-1 cursor-pointer truncate"
          onClick={() => {
            window.location.href = `/?builder=true&chatId=${item.urlId}`;
          }}
        >
          <span className="truncate font-medium group-hover:text-blue-300 transition-colors duration-300 block">
            {item.description}
          </span>
        </div>

        {/* Delete button */}
        <div className="flex items-center">
          {hovering && (
            <Dialog.Trigger asChild>
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete?.(event);
                }}
                className="p-1.5 text-thor-elements-textSecondary hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all duration-300"
                title="Delete chat"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </Dialog.Trigger>
          )}
        </div>
      </div>
    </div>
  );
}
