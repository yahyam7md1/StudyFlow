import { motion, AnimatePresence } from 'framer-motion';

interface VersionHistoryProps {
  onClose: () => void;
}

interface ReleaseNote {
  version: string;
  date: string;
  title: string;
  highlights: string[];
  description: string;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({ onClose }) => {
  // Release history data
  const releases: ReleaseNote[] = [
    {
      version: "1.0.0",
      date: "March 2025",
      title: "Initial Release 🚀",
      highlights: [
        "Pomodoro Timer with customizable sessions",
        "Beautiful UI with backdrop effects",
        "Background image selection",
        "Audio controls with different sound options",
        "To-do list functionality",
        "Long break rewards",
        "Fully responsive design"
      ],
      description: "The first official release of Study Flow, designed to help you focus and be productive with a beautiful, distraction-free environment."
    },
    {
      version: "0.9.0",
      date: "December 2024",
      title: "Beta Release",
      highlights: [
        "Core timer functionality",
        "Basic audio controls",
        "Initial UI design",
        "Background selection"
      ],
      description: "Beta testing version with core functionality for early feedback."
    },
    {
      version: "0.5.0",
      date: "November 2024",
      title: "Alpha Release",
      highlights: [
        "Basic pomodoro timer",
        "Simple UI implementation",
        "Initial project setup"
      ],
      description: "First internal alpha version for testing and development."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    },
    exit: { opacity: 0 }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4 overflow-hidden"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-white/5 backdrop-blur-md z-10">
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
            >
              Version History
            </motion.h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl"
            >
              ×
            </motion.button>
          </div>

          {/* Content - Scrollable */}
          <div className="overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {releases.map((release) => (
                <motion.div
                  key={release.version}
                  variants={itemVariants}
                  className={`p-6 rounded-xl border ${
                    release.version === "1.0.0" 
                      ? "bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/30" 
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className={`text-xl font-bold ${
                        release.version === "1.0.0" 
                          ? "text-purple-300" 
                          : "text-white/90"
                      }`}>
                        {release.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          release.version === "1.0.0" 
                            ? "bg-purple-500/30 text-purple-200" 
                            : "bg-white/10 text-white/70"
                        }`}>
                          {release.version}
                        </span>
                        <span className="text-white/50 text-sm">{release.date}</span>
                      </div>
                    </div>
                    
                    {release.version === "1.0.0" && (
                      <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-medium rounded-full">
                        Current Version
                      </span>
                    )}
                  </div>

                  <p className="text-white/70 mb-4">{release.description}</p>

                  <h4 className="text-sm font-semibold text-white/80 mb-2">
                    {release.version === "1.0.0" ? "What's Included:" : "Changes:"}
                  </h4>
                  <ul className="space-y-2">
                    {release.highlights.map((highlight, idx) => (
                      <motion.li 
                        key={idx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 + (idx * 0.05) }}
                        className="flex items-start gap-3 text-white/80"
                      >
                        <span className="text-purple-400 mt-0.5">•</span>
                        <span>{highlight}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-white/50 text-sm py-4"
            >
              <p>Thank you for using Study Flow!</p>
              <p className="mt-1">🎧 Made with ❤️ for productive studying</p>
            </motion.div>
          </div>
          
          {/* Footer with animation dots */}
          <div className="p-4 border-t border-white/10 flex justify-center gap-2 bg-white/5">
            {['from-blue-400', 'from-purple-400', 'from-pink-400'].map((color) => (
              <motion.div
                key={color}
                className={`h-1 w-10 bg-gradient-to-r ${color} to-white/20 rounded-full`}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: color === 'from-blue-400' ? 0 : color === 'from-purple-400' ? 0.5 : 1
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VersionHistory; 