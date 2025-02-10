import { useState, useEffect } from 'react';

const Clock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return (
    <div className="fixed top-4 left-4 text-white/80 backdrop-blur-sm bg-white/10 rounded-lg p-4 shadow-md">
      <div className="text-2xl font-mono font-medium">{formattedTime}</div>
      <div className="text-sm mt-1">{formattedDate}</div>
    </div>
  );
};

export default Clock;