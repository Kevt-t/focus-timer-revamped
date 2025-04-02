import { useState, useEffect } from 'react';

interface Phase {
  label: string; // Label for the phase
  duration: number; // Duration of the phase in seconds
}

interface TimerHook {
  time: number; // Current time in seconds
  isActive: boolean; // Timer active state
  currentPhaseIndex: number; // Current phase index
  phaseElapsedTime: number; // Elapsed time for the current phase
  start: () => void; // Function to start the timer
  pause: () => void; // Function to pause the timer
  resume: () => void; // Function to resume the timer
  reset: () => void; // Function to reset the timer
  isPaused: boolean; // Timer paused state
}

// useTimer hook provides phase-aware timer functionality with start, pause, resume, and reset controls
// Manages the timer state, phase transitions, and updates time at one-second intervals
// Returns the current time, active state, phase index, elapsed time, and control functions
export const useTimer = (phases: Phase[], initialPhaseIndex: number = 0): TimerHook => {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(initialPhaseIndex); // State for tracking current phase index
  const [phaseElapsedTime, setPhaseElapsedTime] = useState<number>(0); // State for tracking elapsed time in current phase
  const [time, setTime] = useState<number>(phases[currentPhaseIndex].duration); // State for tracking time
  const [isActive, setIsActive] = useState<boolean>(false); // State for tracking if the timer is active
  const [isPaused, setIsPaused] = useState<boolean>(false); // State for tracking if the timer is paused

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setPhaseElapsedTime((prevElapsed) => prevElapsed + 1); // Increment elapsed time
        setTime((prevTime) => {
          if (prevTime > 0) return prevTime - 1; // Decrement time every second
          if (currentPhaseIndex < phases.length - 1) {
            setCurrentPhaseIndex((prevIndex) => prevIndex + 1); // Move to next phase
            setPhaseElapsedTime(0); // Reset elapsed time for new phase
            return phases[currentPhaseIndex + 1].duration; // Set time for next phase
          } else {
            setIsActive(false); // Stop timer if last phase is complete
            return 0;
          }
        });
      }, 1000);
    } else if ((!isActive || isPaused) && time !== 0 && interval !== undefined) {
      clearInterval(interval); // Clear interval if timer is paused
    }
    return () => {
      if (interval !== undefined) clearInterval(interval); // Cleanup interval on unmount
    };
  }, [isActive, isPaused, time, currentPhaseIndex, phases]);

  const start = () => {
    setIsActive(true);
    setIsPaused(false);
  }; // Start the timer
  const pause = () => setIsPaused(true); // Pause the timer
  const resume = () => setIsPaused(false); // Resume the timer
  const reset = () => {
    setIsActive(false);
    setIsPaused(false);
    setCurrentPhaseIndex(initialPhaseIndex);
    setPhaseElapsedTime(0);
    setTime(phases[initialPhaseIndex].duration);
  }; // Reset the timer

  return {
    time,
    isActive,
    currentPhaseIndex,
    phaseElapsedTime,
    start,
    pause,
    resume,
    reset,
    isPaused,
  };
};
