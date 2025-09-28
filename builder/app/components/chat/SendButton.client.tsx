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
          className="absolute flex justify-center items-center top-[18px] right-[22px] p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg w-[40px] h-[40px] shadow-lg hover:shadow-xl transition-all duration-200 border border-blue-500/30 z-20"
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
              <div className="text-white text-base">▶</div>
            ) : (
              <div className="text-white text-base">⏹</div>
            )}
          </div>
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}
