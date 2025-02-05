import { useState, useEffect, useCallback } from 'react';

type TimerProps = {
  studyMins: number;
  breakMins: number;
  sessions: number;
};

export default function Timer({ studyMins = 25, breakMins = 5, sessions = 4 }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(studyMins * 60);
  const [isActive, setIsActive] = useState(false);
  const [currentSession, setCurrentSession] = useState(1);
  const [isStudyTime, setIsStudyTime] = useState(true);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTimeLeft(isStudyTime ? studyMins * 60 : breakMins * 60);
  }, [isStudyTime, studyMins, breakMins, sessions]);

  useEffect(() => {
    let interval: number;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (currentSession >= sessions) {
        resetTimer();
        return;
      }
      
      setIsStudyTime(!isStudyTime);
      setCurrentSession(prev => (isStudyTime ? prev + 1 : prev));
      setTimeLeft(isStudyTime ? breakMins * 60 : studyMins * 60);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, isStudyTime, currentSession, sessions, resetTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-center">
      <div className="text-6xl font-mono mb-4">
        {formatTime(timeLeft)}
      </div>
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => setIsActive(!isActive)}
          className="px-6 py-3 bg-green-600 rounded-lg text-white hover:bg-green-700"
        >
          {isActive ? '⏸️ Pause' : '▶️ Start'}
        </button>
        <button
          onClick={resetTimer}
          className="px-6 py-3 bg-red-600 rounded-lg text-white hover:bg-red-700"
        >
          🔄 Reset
        </button>
      </div>
      <div className="mt-4 text-black-900 font-bold">
        Session {currentSession}/{sessions} • {isStudyTime ? '📚 Study' : '☕ Break'}
      </div>
    </div>
  );
}