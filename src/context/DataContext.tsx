import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define session data types
export interface SessionData {
  id: string;
  type: 'pomodoro' | 'shortBreak' | 'longBreak' | 'custom';
  startTime: string;
  endTime: string | null;
  duration: number; // in seconds
  completed: boolean;
  targetEndTime: string; // When the timer should end if not paused
  pausedAt: string | null; // Timestamp when the timer was paused
  totalPausedTime: number; // Total time in milliseconds the timer has been paused
}

export interface DailyStats {
  date: string;
  completedSessions: number;
  totalFocusTime: number; // in seconds
  totalPauseTime: number; // in seconds
}

export interface UserStats {
  totalSessions: number;
  completedSessions: number;
  currentStreak: number;
  longestStreak: number;
  dailyStats: DailyStats[];
  sessionHistory: SessionData[];
}

// Default stats
const defaultStats: UserStats = {
  totalSessions: 0,
  completedSessions: 0,
  currentStreak: 0,
  longestStreak: 0,
  dailyStats: [],
  sessionHistory: []
};

// Create the context
interface DataContextType {
  stats: UserStats;
  currentSession: SessionData | null;
  startSession: (type: 'pomodoro' | 'shortBreak' | 'longBreak' | 'custom', duration: number) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  completeSession: () => void;
  cancelSession: () => void;
  resetStats: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Provider component
interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [stats, setStats] = useState<UserStats>(() => {
    // Load stats from localStorage if available
    const savedStats = localStorage.getItem('timerStats');
    return savedStats ? JSON.parse(savedStats) : defaultStats;
  });
  
  const [currentSession, setCurrentSession] = useState<SessionData | null>(() => {
    // Load current session from localStorage if available
    const savedSession = localStorage.getItem('currentSession');
    if (savedSession) {
      const parsedSession = JSON.parse(savedSession) as SessionData;
      
      // Check if the session is still valid (not expired)
      const now = new Date();
      const targetEnd = new Date(parsedSession.targetEndTime);
      
      // If the session has already ended and wasn't completed, mark it as expired
      if (targetEnd < now && !parsedSession.completed && !parsedSession.pausedAt) {
        // Auto-complete expired sessions
        const completedSession: SessionData = {
          ...parsedSession,
          endTime: targetEnd.toISOString(), // End at the target time, not now
          completed: true
        };
        
        // Update session history asynchronously
        setTimeout(() => {
          setStats(prev => {
            const updatedHistory = [...prev.sessionHistory, completedSession];
            return {
              ...prev,
              completedSessions: prev.completedSessions + 1,
              sessionHistory: updatedHistory
            };
          });
          updateDailyStats(completedSession);
        }, 0);
        
        return null; // Don't restore expired sessions
      }
      
      return parsedSession;
    }
    return null;
  });

  // Save stats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('timerStats', JSON.stringify(stats));
  }, [stats]);

  // Save current session to localStorage whenever it changes
  useEffect(() => {
    if (currentSession) {
      localStorage.setItem('currentSession', JSON.stringify(currentSession));
    } else {
      localStorage.removeItem('currentSession');
    }
  }, [currentSession]);

  // Calculate streak on app initialization and when stats change
  useEffect(() => {
    calculateStreak();
  }, [stats.sessionHistory]);

  const calculateStreak = () => {
    if (stats.sessionHistory.length === 0) return;

    const today = new Date().toISOString().split('T')[0];
    const sortedSessions = [...stats.sessionHistory]
      .filter(session => session.completed)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    // Check if there's a completed session today
    const hasSessionToday = sortedSessions.some(
      session => session.startTime.split('T')[0] === today
    );

    if (!hasSessionToday) {
      // No session today, check if there was one yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      const hasSessionYesterday = sortedSessions.some(
        session => session.startTime.split('T')[0] === yesterdayStr
      );

      if (!hasSessionYesterday) {
        // Streak broken
        setStats(prev => ({
          ...prev,
          currentStreak: 0
        }));
        return;
      }
    }

    // Calculate current streak
    let currentStreak = 0;
    let currentDate = new Date();
    let dateToCheck = currentDate.toISOString().split('T')[0];
    let daysChecked = 0;
    let streakActive = hasSessionToday;

    while (streakActive && daysChecked < 365) { // Limit to avoid infinite loop
      const hasSessionOnDate = sortedSessions.some(
        session => session.startTime.split('T')[0] === dateToCheck
      );

      if (hasSessionOnDate) {
        currentStreak++;
      } else if (daysChecked > 0) { // Skip first day if no session today
        streakActive = false;
        break;
      }

      // Move to previous day
      currentDate.setDate(currentDate.getDate() - 1);
      dateToCheck = currentDate.toISOString().split('T')[0];
      daysChecked++;
    }

    // Update streak in stats
    setStats(prev => ({
      ...prev,
      currentStreak,
      longestStreak: Math.max(prev.longestStreak, currentStreak)
    }));
  };

  const updateDailyStats = (session: SessionData) => {
    const sessionDate = session.startTime.split('T')[0];
    
    setStats(prev => {
      // Check if we already have stats for this date
      const existingDailyStatIndex = prev.dailyStats.findIndex(
        stat => stat.date === sessionDate
      );

      let updatedDailyStats = [...prev.dailyStats];

      if (existingDailyStatIndex >= 0) {
        // Update existing daily stat
        const existingStat = updatedDailyStats[existingDailyStatIndex];
        updatedDailyStats[existingDailyStatIndex] = {
          ...existingStat,
          completedSessions: existingStat.completedSessions + 1,
          totalFocusTime: existingStat.totalFocusTime + session.duration,
          totalPauseTime: existingStat.totalPauseTime + Math.floor(session.totalPausedTime / 1000) // Convert ms to seconds
        };
      } else {
        // Create new daily stat
        updatedDailyStats.push({
          date: sessionDate,
          completedSessions: 1,
          totalFocusTime: session.duration,
          totalPauseTime: Math.floor(session.totalPausedTime / 1000) // Convert ms to seconds
        });
      }

      // Sort daily stats by date (newest first)
      updatedDailyStats.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      return {
        ...prev,
        dailyStats: updatedDailyStats
      };
    });
  };

  const startSession = (type: 'pomodoro' | 'shortBreak' | 'longBreak' | 'custom', duration: number) => {
    // Check if a session already exists
    if (currentSession) {
      console.log('Session already exists, not creating a new one');
      return;
    }
    
    const now = new Date();
    const targetEndTime = new Date(now.getTime() + duration * 1000);
    
    const newSession: SessionData = {
      id: Date.now().toString(),
      type,
      startTime: now.toISOString(),
      endTime: null,
      duration,
      completed: false,
      targetEndTime: targetEndTime.toISOString(),
      pausedAt: null,
      totalPausedTime: 0
    };

    setCurrentSession(newSession);
    
    setStats(prev => ({
      ...prev,
      totalSessions: prev.totalSessions + 1
    }));
  };

  const completeSession = () => {
    if (!currentSession) return;
    
    // Ensure we have the most up-to-date pause time
    // If the session is paused when completed, add the final pause duration
    let finalPausedTime = currentSession.totalPausedTime;
    if (currentSession.pausedAt) {
      const now = new Date();
      const pausedAt = new Date(currentSession.pausedAt);
      finalPausedTime += (now.getTime() - pausedAt.getTime());
    }

    const completedSession: SessionData = {
      ...currentSession,
      endTime: new Date().toISOString(),
      completed: true,
      totalPausedTime: finalPausedTime
    };

    // Update session history
    setStats(prev => {
      const updatedHistory = [...prev.sessionHistory, completedSession];
      
      return {
        ...prev,
        completedSessions: prev.completedSessions + 1,
        sessionHistory: updatedHistory
      };
    });

    // Update daily stats
    updateDailyStats(completedSession);
    
    // Clear current session
    setCurrentSession(null);
  };

  const cancelSession = () => {
    if (!currentSession) return;

    const cancelledSession: SessionData = {
      ...currentSession,
      endTime: new Date().toISOString(),
      completed: false
    };

    // Update session history
    setStats(prev => ({
      ...prev,
      sessionHistory: [...prev.sessionHistory, cancelledSession]
    }));

    // Clear current session
    setCurrentSession(null);
  };

  const resetStats = () => {
    if (window.confirm('Are you sure you want to reset all your stats? This cannot be undone.')) {
      setStats(defaultStats);
      setCurrentSession(null);
    }
  };
  
  // Pause the current session
  const pauseSession = () => {
    if (!currentSession || currentSession.pausedAt) return;
    
    const now = new Date().toISOString();
    setCurrentSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        pausedAt: now
      };
    });
  };
  
  // Resume the current session
  const resumeSession = () => {
    if (!currentSession || !currentSession.pausedAt) return;
    
    const now = new Date();
    const pausedAt = new Date(currentSession.pausedAt);
    const pauseDuration = now.getTime() - pausedAt.getTime();
    
    // Calculate new target end time by adding pause duration
    const newTargetEndTime = new Date(new Date(currentSession.targetEndTime).getTime() + pauseDuration);
    
    setCurrentSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        pausedAt: null,
        totalPausedTime: prev.totalPausedTime + pauseDuration,
        targetEndTime: newTargetEndTime.toISOString()
      };
    });
  };

  return (
    <DataContext.Provider value={{
      stats,
      currentSession,
      startSession,
      pauseSession,
      resumeSession,
      completeSession,
      cancelSession,
      resetStats
    }}>
      {children}
    </DataContext.Provider>
  );
};

// Calculate remaining time for a session
export const calculateRemainingTime = (session: SessionData | null): number => {
  if (!session) return 0;
  
  const now = new Date();
  
  // If session is paused, calculate based on the pause time
  if (session.pausedAt) {
    const targetEnd = new Date(session.targetEndTime);
    const pausedAt = new Date(session.pausedAt);
    return Math.max(0, Math.floor((targetEnd.getTime() - pausedAt.getTime()) / 1000));
  }
  
  // Otherwise calculate based on current time
  const targetEnd = new Date(session.targetEndTime);
  return Math.max(0, Math.floor((targetEnd.getTime() - now.getTime()) / 1000));
};

// Custom hook for using the data context
export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
