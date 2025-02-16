import { useState, useEffect, useCallback } from 'react';
import { playBreakEndAlert, playSessionEndAlert } from '../utils/audio';
import { AnimatePresence, motion } from 'framer-motion';

type TimerProps = {
  studyMins?: number;
  breakMins?: number;
  sessions?: number;
};

const Timer = ({ studyMins = 25, breakMins = 5, sessions = 4 }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState<number>(studyMins * 60);
  const [isActive, setIsActive] = useState(false);
  const [currentSession, setCurrentSession] = useState(1);
  const [isStudyTime, setIsStudyTime] = useState(true);
  const [isLongBreak, setIsLongBreak] = useState(false);
  const [showResetOptions, setShowResetOptions] = useState(false);

  const startLongBreak = useCallback(() => {
    setIsLongBreak(true);
    setTimeLeft(1800);
    setIsStudyTime(false);
    setIsActive(true);
  }, []);

  const resetCurrentSession = useCallback(() => {
    setIsActive(false);
    setTimeLeft(isStudyTime ? studyMins * 60 : breakMins * 60);
    setShowResetOptions(false);
  }, [isStudyTime, studyMins, breakMins]);

  const resetEverything = useCallback(() => {
    setIsActive(false);
    setIsLongBreak(false);
    setCurrentSession(1);
    setIsStudyTime(true);
    setTimeLeft(studyMins * 60);
    setShowResetOptions(false);
  }, [studyMins]);

  useEffect(() => {
    let interval: number;
    
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (isLongBreak) {
        window.location.reload();
        return;
      }

      if (isStudyTime) {
        if (currentSession < sessions) playSessionEndAlert();
        
        if (currentSession >= sessions) {
          playSessionEndAlert();
          startLongBreak();
          return;
        }

        setIsStudyTime(false);
        setTimeLeft(breakMins * 60);
      } else {
        playBreakEndAlert();
        setIsStudyTime(true);
        setCurrentSession(prev => prev + 1);
        setTimeLeft(studyMins * 60);
      }
    }

    return () => window.clearInterval(interval);
  }, [isActive, timeLeft, isStudyTime, currentSession, sessions, isLongBreak, startLongBreak, breakMins, studyMins]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const longBreakVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: 'spring', 
        stiffness: 100,
        damping: 20,
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      y: -50, 
      scale: 0.9,
      transition: { duration: 0.2 } 
    }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (isLongBreak) {
    return (
      <AnimatePresence mode='wait'>
        <motion.div
          key="long-break"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={longBreakVariants}
          className="text-center space-y-8"
        >
          <div className="font-bold bg-gradient-to-r 
            from-purple-400 via-pink-300 to-blue-400 
            animate-gradient bg-clip-text text-transparent
            drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]">
            
            <motion.h2 
              variants={childVariants}
              className="text-3xl font-bold text-green-400 mb-4"
            >
              🎉 Well Done! 🎉
            </motion.h2>
            
            <motion.p 
              variants={childVariants}
              className="text-white/90 mb-6 text-lg"
            >
              You completed all {sessions} sessions!<br />
              Enjoy a 30-minute break!
            </motion.p>
            
            <motion.div 
              variants={childVariants}
              className="text-7xl font-mono text-white/90 mb-6"
            >
              {formatTime(timeLeft)}
              {timeLeft === 0 && playSessionEndAlert()}
            </motion.div>
            
            <motion.button
              variants={childVariants}
              onClick={() => {
                playSessionEndAlert();
                resetEverything();
              }}
              className="px-6 py-3 bg-white/20 rounded-lg text-white
                hover:bg-white/30 transition-all shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ⏹️ End Break Early
            </motion.button>
            
            <motion.p 
              variants={childVariants}
              className="mt-6 text-sm text-white/70"
            >
              Page will refresh automatically when break ends
            </motion.p>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="text-center space-y-6 relative">
      {/* Timer Display */}
      <div className="text-8xl font-bold bg-gradient-to-r 
        from-purple-400 via-pink-300 to-blue-400 
        animate-gradient bg-gradien-stretch
        bg-clip-text text-transparent
        drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]">
        {formatTime(timeLeft)}
      </div>

      {/* Session Indicator */}
      <div className="mx-auto w-fit px-6 py-3 bg-white/10 backdrop-blur-lg 
        rounded-full border border-white/20 shadow-sm my-4">
        <div className="flex items-center gap-3 text-white/90">
          <span className="font-medium">Session {currentSession}/{sessions}</span>
          <span className="text-2xl">
            {isStudyTime ? '📚' : '☕'}
          </span>
          <span className="font-light text-white/70">
            {isStudyTime ? 'Focus Time' : 'Break Time'}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-6 justify-center mt-6">
        <button
          onClick={() => setIsActive(!isActive)}
          className={`px-8 py-4 rounded-xl text-white transition-all duration-300 ${
            isActive 
              ? 'bg-red-500/30 backdrop-blur-lg border-2 border-red-300/50 shadow-lg' 
              : 'bg-emerald-500/30 backdrop-blur-lg border-2 border-emerald-300/50 shadow-lg hover:bg-emerald-500/40'
          }`}
        >
          {isActive ? '⏸️ Pause' : '▶️ Start'}
        </button>
        
        <button
          onClick={() => setShowResetOptions(true)}
          className="px-8 py-4 bg-white/10 backdrop-blur-sm rounded-xl text-white 
            border-2 border-transparent hover:bg-white/20 transition-all
            hover:border-white/30 shadow-md"
        >
          🔄 Reset
        </button>
      </div>

      {/* Reset Options Modal */}
      <AnimatePresence>
  {showResetOptions && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: -20 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="bg-white/10 backdrop-blur-lg p-6 rounded-xl space-y-4 w-80 border border-white/20 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-4">
          <motion.h3 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-bold"
          >
            Reset Options
          </motion.h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowResetOptions(false)}
            className="text-white/70 hover:text-white text-2xl"
          >
            ×
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={resetCurrentSession}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500/90 to-purple-500/90 rounded-lg text-white
              hover:from-blue-600 hover:to-purple-600 transition-all font-semibold shadow-lg"
          >
            Reset Current Session
            <span className="block text-sm text-white/70 mt-1">
              ({isStudyTime ? 'Focus' : 'Break'})
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={resetEverything}
            className="w-full px-6 py-3 bg-gradient-to-r from-red-500/90 to-pink-500/90 rounded-lg text-white
              hover:from-red-600 hover:to-pink-600 transition-all font-semibold shadow-lg"
          >
            Reset Everything
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowResetOptions(false)}
            className="w-full px-6 py-3 bg-white/10 rounded-lg text-white
              hover:bg-white/20 transition-all border border-white/20"
          >
            Cancel
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center gap-2 mt-4"
        >
          {['from-blue-400', 'from-purple-400', 'from-pink-400'].map((color) => (
            <motion.div
              key={color}
              className={`h-1 w-8 bg-gradient-to-r ${color} to-white/20 rounded-full`}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
    </div>
  );
};

export default Timer;