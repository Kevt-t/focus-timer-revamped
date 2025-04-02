import React, { useState, useEffect } from 'react';
import ProgressIndicator from '../feedback/ProgressIndicator';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// TimerDisplay component manages the display and control of the timer
// It uses state to track the time and whether the timer is active
// Buttons allow the user to start, pause, and reset the timer

const TimerDisplay: React.FC = () => {
  const [time, setTime] = useState<number>(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState<boolean>(false); // Timer active state
  const [percentage, setPercentage] = useState<number>(0); // Progress percentage

  const notify = (message: string, type: 'success' | 'error' | 'info') => {
    if (type === 'success') toast.success(message);
    else if (type === 'error') toast.error(message);
    else toast.info(message);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isActive) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime > 0 ? prevTime - 1 : 0;
          setPercentage(((25 * 60 - newTime) / (25 * 60)) * 100); // Calculate progress percentage
          return newTime;
        });
      }, 1000);
    } else if (!isActive && time !== 0 && interval !== undefined) {
      clearInterval(interval); // Clear interval if timer is paused
    }
    return () => {
      if (interval !== undefined) clearInterval(interval); // Cleanup interval on unmount
    };
  }, [isActive, time]);

  useEffect(() => {
    if (isActive) {
      notify('Session started', 'success');
    } else if (!isActive && time !== 25 * 60) {
      notify('Session paused', 'info');
    }
  }, [isActive]);

  useEffect(() => {
    if (time === 0 && isActive) {
      notify('Break started', 'info');
    }
  }, [time, isActive]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`; // Format time as MM:SS
  };

  const handleStart = () => {
    setIsActive(true); // Start the timer
  };

  const handlePause = () => {
    setIsActive(false); // Pause the timer
  };

  const handleReset = () => {
    setIsActive(false); // Stop the timer
    setTime(25 * 60); // Reset time to initial value
    setPercentage(0); // Reset progress percentage
    notify('Session reset', 'error');
  };

  return (
    <div className="timer-display bg-gray-100 p-4 rounded-lg shadow-md flex flex-col items-center">
      <ProgressIndicator percentage={percentage} label={formatTime(time)} />
      <div className="flex space-x-2 mt-4">
        <button className="start-button bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50" onClick={handleStart} disabled={isActive}>Start</button> {/* Start button */}
        <button className="pause-button bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 disabled:opacity-50" onClick={handlePause} disabled={!isActive}>Pause</button> {/* Pause button */}
        <button className="reset-button bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600" onClick={handleReset}>Reset</button> {/* Reset button */}
      </div>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default TimerDisplay;
