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
    <div className="clock-container">
      <div className="clock-time">{formattedTime}</div>
      <div className="clock-date">{formattedDate}</div>
    </div>
  );
};

export default Clock;