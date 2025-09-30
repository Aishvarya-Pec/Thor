import { AnimatePresence, cubicBezier, motion } from 'framer-motion';

interface SendButtonProps {
  show: boolean;
  isStreaming?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const customEasingFn = cubicBezier(0.4, 0, 0.2, 1);

export function SendButton({ show, isStreaming, onClick }: SendButtonProps) {
  return (
    <AnimatePresence>
      {show ? (
        <motion.button
          className="absolute right-3 bottom-3 md:right-4 md:top-1/2 md:-translate-y-1/2 flex items-center gap-2 px-4 py-2 rounded-full text-white bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-blue-500 shadow-[0_0_12px_rgba(99,102,241,0.8)] hover:shadow-[0_0_18px_rgba(168,85,247,0.95)]"
          transition={{ ease: customEasingFn, duration: 0.17 }}
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(event) => {
            event.preventDefault();
            onClick?.(event);
          }}
        >
          <div className="text-lg flex items-center justify-center">
            {!isStreaming ? (
              <>
                <div className="i-ph:paper-plane-right-duotone text-xl" />
                <span className="font-semibold tracking-wide">Send</span>
              </>
            ) : (
              <>
                <div className="i-ph:hand-palm-duotone text-xl" />
                <span className="font-semibold tracking-wide">Stop</span>
              </>
            )}
          </div>
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}
