import { useState, useEffect, useCallback, useRef } from 'react';
import { playBreakEndAlert, playSessionEndAlert } from '../utils/audio';
import { AnimatePresence, motion } from 'framer-motion';
import ProgressBar from './ProgressBar';

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
  
  // Worker reference
  const workerRef = useRef<Worker | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Add wake lock reference
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const startLongBreak = useCallback(() => {
    setIsLongBreak(true);
    setTimeLeft(1800); // 30 minutes in seconds
    setIsStudyTime(false);
    setIsActive(true);
    
    // Start the timer in the worker
    if (workerRef.current) {
      workerRef.current.postMessage({ 
        type: 'start', 
        timeLeft: 1800 
      });
    }
  }, []);

  // Function to request wake lock
  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        
        // Add event listener for when the wake lock is released
        wakeLockRef.current.addEventListener('release', () => {
          console.log('Wake Lock was released');
        });
      }
    } catch (err) {
      console.error('Error requesting wake lock:', err);
    }
  }, []);

  // Function to release wake lock
  const releaseWakeLock = useCallback(() => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release()
        .then(() => {
          wakeLockRef.current = null;
        })
        .catch((err) => {
          console.error('Error releasing wake lock:', err);
        });
    }
  }, []);

  // Function to handle timer completion
  const handleTimerComplete = useCallback(() => {
    // First, stop any existing timer
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'stop' });
    }
    setIsActive(false);

    if (isLongBreak) {
      // When long break completes, reset everything and start from the beginning
      setIsLongBreak(false);
      setIsStudyTime(true);
      setCurrentSession(1);
      setTimeLeft(studyMins * 60);
      
      // Play a notification sound to alert the user
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      playSessionEndAlert();
      
      // Don't automatically start the timer, let user start it manually
      return;
    }

    if (isStudyTime) {
      // If this is the last session, go directly to long break
      if (currentSession >= sessions) {
        if (audioContextRef.current?.state === 'suspended') {
          audioContextRef.current.resume();
        }
        playSessionEndAlert();
        startLongBreak();
        return;
      } else {
        // For non-last sessions, play alert and go to break
        if (audioContextRef.current?.state === 'suspended') {
          audioContextRef.current.resume();
        }
        playSessionEndAlert();
        setIsStudyTime(false);
        setTimeLeft(breakMins * 60);
        
        // Start the break timer
        if (workerRef.current) {
          workerRef.current.postMessage({ 
            type: 'start', 
            timeLeft: breakMins * 60 
          });
        }
        setIsActive(true);
      }
    } else {
      // Break time is over, go to next study session
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      playBreakEndAlert();
      setIsStudyTime(true);
      setCurrentSession(prev => prev + 1);
      setTimeLeft(studyMins * 60);
      
      // Start the next focus session timer
      if (workerRef.current) {
        workerRef.current.postMessage({ 
          type: 'start', 
          timeLeft: studyMins * 60 
        });
      }
      setIsActive(true);
    }
  }, [isStudyTime, currentSession, sessions, isLongBreak, startLongBreak, breakMins, studyMins]);

  // Request wake lock when component mounts
  useEffect(() => {
    requestWakeLock();
    
    // Clean up wake lock when component unmounts
    return () => {
      releaseWakeLock();
    };
  }, [requestWakeLock, releaseWakeLock]);

  // Initialize audio context and worker
  useEffect(() => {
    // Create audio context
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Resume audio context on user interaction
    const resumeAudioContext = () => {
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
    };
    
    // Add event listeners for user interaction
    document.addEventListener('click', resumeAudioContext);
    document.addEventListener('keydown', resumeAudioContext);
    document.addEventListener('touchstart', resumeAudioContext);
    
    // Create the worker
    workerRef.current = new Worker(new URL('../utils/timerWorker.ts', import.meta.url), { type: 'module' });
    
    // Set up worker message handler
    workerRef.current.onmessage = (e) => {
      const { type, remainingTime } = e.data;
      
      if (type === 'tick') {
        setTimeLeft(remainingTime);
      } else if (type === 'complete') {
        // Stop the current timer
        if (workerRef.current) {
          workerRef.current.postMessage({ type: 'stop' });
        }
        setIsActive(false);
        
        // Then handle the completion
        handleTimerComplete();
      }
    };
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (workerRef.current) {
        workerRef.current.terminate();
      }
      document.removeEventListener('click', resumeAudioContext);
      document.removeEventListener('keydown', resumeAudioContext);
      document.removeEventListener('touchstart', resumeAudioContext);
    };
  }, [handleTimerComplete]);

  // Handle timer start/stop/pause
  useEffect(() => {
    if (!workerRef.current) return;
    
    if (isActive && timeLeft > 0) {
      // Start the timer in the worker
      workerRef.current.postMessage({ 
        type: 'start', 
        timeLeft 
      });
    } else if (!isActive) {
      // Pause the timer in the worker
      workerRef.current.postMessage({ 
        type: 'pause' 
      });
    }
    
    return () => {
      // Clean up when component unmounts
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'stop' });
      }
    };
  }, [isActive, timeLeft]);

  // Handle timeLeft changes
  useEffect(() => {
    if (isActive && workerRef.current) {
      // Update the timer in the worker when timeLeft changes
      workerRef.current.postMessage({ 
        type: 'resume', 
        timeLeft 
      });
    }
  }, [timeLeft, isActive]);

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

  const skipToNextSession = useCallback(() => {
    if (isStudyTime) {
      // If this is the last session and we're in study time, skip directly to long break
      if (currentSession >= sessions) {
        playSessionEndAlert();
        startLongBreak();
      } else {
        // Otherwise, skip from study to break time as usual
        playSessionEndAlert();
        setIsStudyTime(false);
        // Add a small timeout to ensure state updates are processed
        setTimeout(() => {
          // Force set the time to break minutes to prevent UI inconsistency
          if (!isStudyTime) {
            setTimeLeft(breakMins * 60);
          }
        }, 50);
        setTimeLeft(breakMins * 60);
      }
    } else {
      // Skip from break to the next study session or long break
      playBreakEndAlert();
      if (currentSession >= sessions) {
        // If this was the last session's break, go to long break
        startLongBreak();
      } else {
        // Go to the next study session
        setIsStudyTime(true);
        setCurrentSession(prev => prev + 1);
        // Add a small timeout to ensure state updates are processed
        setTimeout(() => {
          // Force set the time to study minutes to prevent UI inconsistency
          if (isStudyTime) {
            setTimeLeft(studyMins * 60);
          }
        }, 50);
        setTimeLeft(studyMins * 60);
      }
    }
    // Add a small delay before allowing the reset options to close
    // to ensure state updates are completed
    setTimeout(() => {
      setShowResetOptions(false);
    }, 50);
  }, [isStudyTime, currentSession, sessions, breakMins, studyMins, startLongBreak]);

  const goToPreviousSession = useCallback(() => {
    // If in long break, go back to last study session
    if (isLongBreak) {
      setIsLongBreak(false);
      setIsStudyTime(true);
      setCurrentSession(sessions);
      // Add a small timeout to ensure state updates are processed
      setTimeout(() => {
        // Force set the time to study minutes to prevent UI inconsistency
        if (isStudyTime && !isLongBreak) {
          setTimeLeft(studyMins * 60);
        }
      }, 50);
      setTimeLeft(studyMins * 60);
    } 
    // If in first session and study time, can't go back further
    else if (currentSession === 1 && isStudyTime) {
      return;
    } 
    // If in break time of session 1, go back to study time of session 1
    else if (currentSession === 1 && !isStudyTime) {
      setIsStudyTime(true);
      // Add a small timeout to ensure state updates are processed
      setTimeout(() => {
        // Force set the time to study minutes to prevent UI inconsistency
        if (isStudyTime) {
          setTimeLeft(studyMins * 60);
        }
      }, 50);
      setTimeLeft(studyMins * 60);
    }
    // If in study time of session > 1, go back to break time of previous session
    else if (isStudyTime && currentSession > 1) {
      setIsStudyTime(false);
      setCurrentSession(prev => prev - 1);
      // Add a small timeout to ensure state updates are processed
      setTimeout(() => {
        // Force set the time to break minutes to prevent UI inconsistency
        if (!isStudyTime) {
          setTimeLeft(breakMins * 60);
        }
      }, 50);
      setTimeLeft(breakMins * 60);
    } 
    // If in break time of session > 1, go back to study time of current session
    else if (!isStudyTime && currentSession > 1) {
      setIsStudyTime(true);
      // Add a small timeout to ensure state updates are processed
      setTimeout(() => {
        // Force set the time to study minutes to prevent UI inconsistency
        if (isStudyTime) {
          setTimeLeft(studyMins * 60);
        }
      }, 50);
      setTimeLeft(studyMins * 60);
    }
    // Add a small delay before allowing the reset options to close
    // to ensure state updates are completed
    setTimeout(() => {
      setShowResetOptions(false);
    }, 50);
  }, [isStudyTime, currentSession, sessions, breakMins, studyMins, isLongBreak]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Add functions to handle time adjustments
  const addTwoMinutes = () => {
    
    const currentMins = Math.floor(timeLeft / 60);
    const maxMins = isStudyTime ? studyMins : (isLongBreak ? 30 : breakMins);
    
    // Calculate how many minutes we can add without exceeding the maximum
    const minutesToAdd = Math.min(2, maxMins - currentMins);
    
    if (minutesToAdd > 0) {
      setTimeLeft((currentMins + minutesToAdd) * 60);
    }
  };

  const subtractTwoMinutes = () => {
    
    const currentMins = Math.floor(timeLeft / 60);
    
    // Calculate how many minutes we can subtract without going below 0
    const minutesToSubtract = Math.min(2, currentMins);
    
    if (minutesToSubtract > 0) {
      setTimeLeft((currentMins - minutesToSubtract) * 60);
    }
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
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={subtractTwoMinutes}
                  className="text-4xl font-bold text-white/80 hover:text-white transition-all hover:scale-110"
                >
                  -
                </button>
                {formatTime(timeLeft)}
                <button
                  onClick={addTwoMinutes}
                  className="text-4xl font-bold text-white/80 hover:text-white transition-all hover:scale-110"
                >
                  +
                </button>
              </div>
              <ProgressBar
                currentTime={timeLeft}
                totalTime={1800} // 30 minutes in seconds
                isActive={isActive}
                isStudyTime={false}
              />
              {timeLeft === 0 && playSessionEndAlert()}
            </motion.div>
            
            <div className="space-y-4">
              <motion.button
                variants={childVariants}
                onClick={() => {
                  playSessionEndAlert();
                  resetEverything();
                }}
                className="px-6 py-3 bg-white/20 rounded-lg text-white
                  hover:bg-white/30 transition-all shadow-md w-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ⏹️ End Break Early
              </motion.button>

              <motion.button
                variants={childVariants}
                onClick={() => setIsActive(!isActive)}
                className={`px-6 py-3 rounded-lg text-white transition-all shadow-md w-full ${
                  isActive 
                    ? 'bg-red-500/30 backdrop-blur-lg border-2 border-red-300/50' 
                    : 'bg-emerald-500/30 backdrop-blur-lg border-2 border-emerald-300/50 hover:bg-emerald-500/40'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isActive ? '⏸️ Pause' : '▶️ Start'}
              </motion.button>
            </div>
            
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
      {/* Timer Display with Plus/Minus Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={subtractTwoMinutes}
          className={`text-4xl font-bold text-white/80 hover:text-white transition-all hover:scale-110
            `}
        >
          -
        </button>
        
        <div className="timer-display text-8xl font-bold bg-gradient-to-r 
          from-purple-400 via-pink-300 to-blue-400 
          animate-gradient bg-gradien-stretch
          bg-clip-text text-transparent
          drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]">
          {formatTime(timeLeft)}
          <ProgressBar
            currentTime={timeLeft}
            totalTime={isStudyTime ? studyMins * 60 : breakMins * 60}
            isActive={isActive}
            isStudyTime={isStudyTime}
          />
        </div>
        
        <button
          onClick={addTwoMinutes}
          className={`text-4xl font-bold text-white/80 hover:text-white transition-all
            hover:scale-110`}
        >
          +
        </button>
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
      <div className="control-buttons flex gap-6 justify-center mt-6">
        <button
          onClick={() => setIsActive(!isActive)}
          className={`control-button px-8 py-4 rounded-xl text-white transition-all duration-300 ${
            isActive 
              ? 'bg-red-500/30 backdrop-blur-lg border-2 border-red-300/50 shadow-lg' 
              : 'bg-emerald-500/30 backdrop-blur-lg border-2 border-emerald-300/50 shadow-lg hover:bg-emerald-500/40'
          }`}
        >
          {isActive ? '⏸️ Pause' : '▶️ Start'}
        </button>
        
        <button
          onClick={() => setShowResetOptions(true)}
          className="control-button px-8 py-4 bg-white/10 backdrop-blur-sm rounded-xl text-white 
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
            onClick={skipToNextSession}
            className="w-full px-6 py-3 bg-gradient-to-r from-amber-500/90 to-orange-500/90 rounded-lg text-white
              hover:from-amber-600 hover:to-orange-600 transition-all font-semibold shadow-lg"
          >
            Skip to Next Session
            <span className="block text-sm text-white/70 mt-1">
              {isStudyTime 
                ? (currentSession >= sessions ? `Focus → Long Break` : `Focus → Break`) 
                : (currentSession < sessions ? `Break → Session ${currentSession + 1}` : `Break → Long Break`)}
            </span>
          </motion.button>

          {/* Only show Go Back button if we're in a break or past session 1 */}
          {(!isStudyTime || currentSession > 1 || isLongBreak) && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={goToPreviousSession}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-500/90 to-teal-500/90 rounded-lg text-white
                hover:from-green-600 hover:to-teal-600 transition-all font-semibold shadow-lg"
            >
              Go Back to Previous
              <span className="block text-sm text-white/70 mt-1">
                {isLongBreak 
                  ? `Long Break → Session ${sessions}` 
                  : isStudyTime
                    ? (currentSession > 1 ? `Focus → Session ${currentSession - 1} Break` : 'At first session')
                    : `Break → Session ${currentSession} Focus`}
              </span>
            </motion.button>
          )}

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