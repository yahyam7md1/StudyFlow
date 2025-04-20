import React from 'react';

interface ProgressBarProps {
  currentTime: number;
  totalTime: number;
  isActive: boolean;
  isStudyTime: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentTime, totalTime, isActive, isStudyTime }) => {
  const progress = ((totalTime - currentTime) / totalTime) * 100;

  return (
    <div className="w-full h-2 bg-gray-200/20 rounded-full mt-2">
      <div
        className={`h-full rounded-full transition-all duration-1000 ${
          isStudyTime ? 'bg-blue-500/80' : 'bg-green-500/80'
        }`}
        style={{
          width: `${progress}%`,
          transition: isActive ? 'width 1s linear' : 'none',
        }}
      />
    </div>
  );
};

export default ProgressBar;
