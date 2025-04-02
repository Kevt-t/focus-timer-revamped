import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface ProgressIndicatorProps {
  percentage: number;
  label?: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ percentage, label }) => {
  return (
    <div className="progress-indicator flex flex-col items-center">
      <CircularProgressbar
        value={percentage}
        text={`${percentage.toFixed(0)}%`}
        styles={buildStyles({
          textSize: '16px',
          pathColor: `#3e98c7`,
          textColor: '#3e98c7',
          trailColor: '#d6d6d6',
          backgroundColor: '#3e98c7',
        })}
      />
      <div className="text-center mt-2 text-xl font-bold">
        {label}
      </div>
    </div>
  );
};

export default ProgressIndicator;
