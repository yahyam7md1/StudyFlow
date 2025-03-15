import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const backgrounds = [
  './backgrounds/default-1.jpg',
  './backgrounds/default-2.jpg',
  './backgrounds/default-3.jpg',
  './backgrounds/default-4.jpg'
];

type Props = {
  currentBackground: string;
  onSelect: (bg: string) => void;
};

export default function BackgroundSelector({ currentBackground, onSelect }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
        when: "beforeChildren",
        staggerChildren: 0.05
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.1,
        ease: "easeInOut",
        when: "afterChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  return (
    <div className="fixed bottom-2.5 right-3 z-10">
    {/* Main button - only shows when CLOSED */}
    {!isOpen && (
      <motion.button
      key="bg-btn"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ delay: 0.5, duration: 0.2 }} // Appears after 0.3s
      onClick={() => setIsOpen(true)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="p-2 bg-white/39 backdrop-blur-sm rounded-full shadow-lg hover:bg-white/20 transition-all"
      >
        🖼️
      </motion.button>
    )}

      <AnimatePresence mode= 'wait'>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
            className="mt-2 p-4 bg-black/90 backdrop-blur-sm rounded-xl shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <motion.h3
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="text-white/90 font-medium text-sm"
              >
                Choose Background
              </motion.h3>
              <motion.button
                onClick={() => setIsOpen(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-white/70 hover:text-white ml-4"
              >
                ✕
              </motion.button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {backgrounds.map((bg) => (
                <motion.div
                  key={bg}
                  variants={itemVariants}
                  className="relative"
                >
                  <button
                    onClick={() => {
                      onSelect(bg);
                      setIsOpen(false);
                    }}
                    className={`relative h-20 w-32 rounded-lg overflow-hidden border-2 ${
                      currentBackground === bg 
                        ? 'border-blue-500' 
                        : 'border-transparent hover:border-white/30'
                    } transition-all`}
                  >
                    <img
                      src={bg}
                      alt="Background"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {currentBackground === bg && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-1 right-1 bg-blue-500 rounded-full p-1"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}