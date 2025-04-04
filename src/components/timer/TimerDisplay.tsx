import React, { useState, useEffect, useCallback, useRef } from 'react';
import ProgressIndicator from '../feedback/ProgressIndicator';
import TimerControls from './TimerControls';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSettings } from '../../context/SettingsContext';
import { useData, calculateRemainingTime } from '../../context/DataContext';
import StatsDisplay from '../data/StatsDisplay';
import ErrorBoundary from '../common/ErrorBoundary';
// Import audio files
import clockStartSound from '../../assets/clockStart.mp3';
import clockEndSound from '../../assets/clockEnd.mp3';

// TimerDisplay component manages the display and control of the timer
// It uses context for settings and data persistence
// Displays timer with progress and controls

const TimerDisplay: React.FC = () => {
  const { settings } = useSettings();
  const { startSession, pauseSession, resumeSession, completeSession, cancelSession, currentSession } = useData();
  
  // Get initial duration based on active preset
  const initialDuration = settings.timerPresets[settings.activePreset] * 60;
  
  // Initialize timer state based on current session if it exists
  const [time, setTime] = useState<number>(() => {
    if (currentSession) {
      return calculateRemainingTime(currentSession);
    }
    return initialDuration;
  });
  
  const [isActive, setIsActive] = useState<boolean>(!!currentSession);
  const [isPaused, setIsPaused] = useState<boolean>(!!currentSession?.pausedAt);
  const [percentage, setPercentage] = useState<number>(0);
  const [showStats, setShowStats] = useState<boolean>(false);
  
  // Track previous timer state to detect changes
  const prevIsActiveRef = useRef<boolean>(false);
  const prevIsPausedRef = useRef<boolean>(false);

  const notify = (message: string, type: 'success' | 'error' | 'info') => {
    if (!settings.notificationsEnabled) return;
    
    if (type === 'success') toast.success(message);
    else if (type === 'error') toast.error(message);
    else toast.info(message);
    
    // Browser notifications if enabled
    if (Notification.permission === 'granted') {
      new Notification('Focus Timer', { body: message });
    }
  };

  // Request notification permission on component mount
  useEffect(() => {
    if (settings.notificationsEnabled && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, [settings.notificationsEnabled]);

  // Reference to the end sound audio element
  const endSoundRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize end sound
  useEffect(() => {
    if (settings.soundEnabled) {
      endSoundRef.current = new Audio(clockEndSound);
    }
    
    return () => {
      if (endSoundRef.current) {
        endSoundRef.current.pause();
        endSoundRef.current = null;
      }
    };
  }, [settings.soundEnabled]);
  
  // Timer effect - uses time-based approach for persistence across page refreshes
  useEffect(() => {
    let interval: number | undefined;
    let endSoundPlayed = false;
    
    if (isActive && !isPaused) {
      // Update time immediately based on current session
      if (currentSession) {
        const remainingTime = calculateRemainingTime(currentSession);
        setTime(remainingTime);
        setPercentage(((currentSession.duration - remainingTime) / currentSession.duration) * 100);
      }
      
      interval = window.setInterval(() => {
        if (currentSession) {
          const remainingTime = calculateRemainingTime(currentSession);
          
          // Update UI with remaining time
          setTime(remainingTime);
          setPercentage(((currentSession.duration - remainingTime) / currentSession.duration) * 100);
          
          // Play end sound when timer is about to end (3 seconds remaining)
          if (settings.soundEnabled && remainingTime <= 3 && remainingTime > 0 && !endSoundPlayed) {
            if (endSoundRef.current) {
              endSoundRef.current.currentTime = 0;
              endSoundRef.current.play().catch(e => console.error('Error playing end sound:', e));
              endSoundPlayed = true;
            }
          }
          
          // Check if timer has reached zero
          if (remainingTime <= 0) {
            window.clearInterval(interval);
            setIsActive(false);
            completeSession();
            notify('Session completed!', 'success');
          }
        }
      }, 1000);
    }
    
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isActive, isPaused, currentSession, completeSession, settings.soundEnabled]);

  // Handle session state changes when timer starts or pauses
  useEffect(() => {
    // Detect state transitions
    const wasInactive = !prevIsActiveRef.current;
    const wasPaused = prevIsPausedRef.current;
    
    // Only handle state transitions if they're user-initiated (not from page load)
    if (document.visibilityState === 'visible') {
      // Starting the timer (inactive -> active)
      if (isActive && !isPaused && wasInactive && !currentSession) {
        // Only create a new session if one doesn't already exist
        startSession(settings.activePreset, initialDuration);
        // Note: Session started notification is now handled in handleStart to avoid duplication
        
        // Play clock start sound if sound is enabled
        if (settings.soundEnabled) {
          const audio = new Audio(clockStartSound);
          audio.play().catch(e => console.error('Error playing sound:', e));
        }
      }
      // Pausing the timer (active & not paused -> active & paused)
      else if (isActive && isPaused && !wasPaused) {
        notify('Session paused', 'info');
      }
      // Resuming the timer (active & paused -> active & not paused)
      else if (isActive && !isPaused && wasPaused) {
        notify('Session resumed', 'info');
      }
    }
    
    // Update refs for next render
    prevIsActiveRef.current = isActive;
    prevIsPausedRef.current = isPaused;
  }, [isActive, isPaused, settings.activePreset, initialDuration, startSession, currentSession]);

  // Reset timer when settings change
  useEffect(() => {
    // Only reset if timer is not active
    if (!isActive) {
      setTime(settings.timerPresets[settings.activePreset] * 60);
      setPercentage(0);
    }
  }, [settings.activePreset, settings.timerPresets, isActive]);



  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStart = useCallback(() => {
    // Only start if not already active
    if (!isActive) {
      setIsActive(true);
      setIsPaused(false);
      // Session creation is handled in the state change effect
      notify('Session started', 'success');
    } else if (isPaused) {
      // Resume if paused
      setIsPaused(false);
      resumeSession();
    }
  }, [isActive, isPaused, resumeSession]);

  const handlePause = useCallback(() => {
    setIsPaused(true);
    pauseSession();
  }, [pauseSession]);

  const handleReset = useCallback(() => {
    // Cancel current session if active
    if (isActive) {
      cancelSession();
    }
    
    setIsActive(false);
    setIsPaused(false);
    setTime(settings.timerPresets[settings.activePreset] * 60);
    setPercentage(0);
    
    // Only show notification if the timer was actually running or paused
    if (isActive || isPaused) {
      notify('Session reset', 'error');
    }
  }, [isActive, isPaused, settings.timerPresets, settings.activePreset, cancelSession]);

  return (
    <ErrorBoundary>
      <div className="timer-display bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center max-w-md w-full">
        <div className="w-full flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold dark:text-white">{settings.activePreset.charAt(0).toUpperCase() + settings.activePreset.slice(1)}</h2>
          <button 
            onClick={() => setShowStats(!showStats)}
            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {showStats ? 'Hide Stats' : 'Show Stats'}
          </button>
        </div>
        
        {showStats ? (
          <StatsDisplay />
        ) : (
          <>
            <ProgressIndicator percentage={percentage} label={formatTime(time)} />
            <TimerControls 
              isActive={isActive && !isPaused}
              onStart={handleStart}
              onPause={handlePause}
              onReset={handleReset}
            />
          </>
        )}
        
        {/* ToastContainer removed - using the global one from App.tsx */}
      </div>
    </ErrorBoundary>
  );
};

export default TimerDisplay;
