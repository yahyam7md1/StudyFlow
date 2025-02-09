import { useState, useEffect, useCallback } from 'react';
import { playBreakEndAlert, playSessionEndAlert } from '../utils/audio';

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

  const startLongBreak = useCallback(() => {
    setIsLongBreak(true);
    setTimeLeft(1800); // 30 minutes in seconds (30 * 60)
    setIsStudyTime(false);
    setIsActive(true);
  }, []);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setIsLongBreak(false);
    setCurrentSession(1);
    setIsStudyTime(true);
    setTimeLeft(studyMins * 60);
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
        // Only play session end alert for non-final sessions
        if (currentSession < sessions) playSessionEndAlert();
        
        // Check if this was the final session
        if (currentSession >= sessions) {
          startLongBreak();
          return;
        }

        // Regular session completion
        setIsStudyTime(false);
        setTimeLeft(breakMins * 60);
      } else {
        // Break completion (only for non-final breaks)
        playBreakEndAlert();
        setIsStudyTime(true);
        setCurrentSession(prev => prev + 1);
        setTimeLeft(studyMins * 60);
      }
    }

    return () => window.clearInterval(interval);
  }, [isActive, timeLeft, isStudyTime, currentSession, sessions, resetTimer, isLongBreak, startLongBreak, breakMins, studyMins]);
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLongBreak) {
    return (
      <div className="text-center space-y-8">
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl">
          <h2 className="text-3xl font-bold text-green-400 mb-4">
            🎉 Well Done! 🎉
          </h2>
          <p className="text-white/90 mb-6 text-lg">
            You completed all {sessions} sessions!<br />
            Enjoy a 30-minute break!
          </p>
          
          <div className="text-6xl font-mono text-white/90 mb-6">
            {formatTime(timeLeft)}
          </div>
          
          <button
            onClick={resetTimer}
            className="px-6 py-3 bg-white/20 rounded-lg text-white
              hover:bg-white/30 transition-all shadow-md"
          >
            ⏹️ End Break Early
          </button>
          
          <p className="mt-6 text-sm text-white/70">
            Page will refresh automatically when break ends
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6">
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
          onClick={resetTimer}
          className="px-8 py-4 bg-white/10 backdrop-blur-sm rounded-xl text-white 
            border-2 border-transparent hover:bg-white/20 transition-all
            hover:border-white/30 shadow-md"
        >
          🔄 Reset
        </button>
      </div>
    </div>
  );
};

export default Timer;