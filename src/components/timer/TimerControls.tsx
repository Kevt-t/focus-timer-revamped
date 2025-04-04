import React from 'react';

interface TimerControlsProps {
  isActive: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

const TimerControls: React.FC<TimerControlsProps> = ({
  isActive,
  onStart,
  onPause,
  onReset
}) => {
  return (
    <div className="flex space-x-2 mt-4">
      <button 
        className="start-button bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50" 
        onClick={onStart} 
        disabled={isActive}
      >
        Start
      </button>
      <button 
        className="pause-button bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 disabled:opacity-50" 
        onClick={onPause} 
        disabled={!isActive}
      >
        Pause
      </button>
      <button 
        className="reset-button bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600" 
        onClick={onReset}
      >
        Reset
      </button>
    </div>
  );
};

export default TimerControls;
