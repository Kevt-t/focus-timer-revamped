import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Achievement system types
export interface AchievementTier {
  level: number;
  requirement: number;
  reward: string;
  progress: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  metric: 'totalFocusTime' | 'currentStreak' | 'completedSessions' | 'dailySessions' | 'weeklySessions';
  tiers: AchievementTier[];
  currentTier: number;
  icon: string;
}

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
  totalFocusTime: number; // in seconds
  dailyStats: DailyStats[];
  sessionHistory: SessionData[];
  achievements: Achievement[];
  lastAchievementCheck: string | null;
}

// Achievement definitions
const defaultAchievements: Achievement[] = [
  {
    id: 'focusMaster',
    title: 'Focus Master',
    description: 'Accumulate total focus time',
    metric: 'totalFocusTime',
    currentTier: 0,
    icon: '⏱️',
    tiers: [
      { level: 1, requirement: 5 * 60, reward: 'Bronze Badge', progress: 0, unlocked: false, unlockedAt: null },
      { level: 2, requirement: 15 * 60, reward: 'Silver Badge', progress: 0, unlocked: false, unlockedAt: null },
      { level: 3, requirement: 30 * 60, reward: 'Gold Badge', progress: 0, unlocked: false, unlockedAt: null }
    ]
  },
  {
    id: 'streakChampion',
    title: 'Streak Champion',
    description: 'Maintain a daily streak',
    metric: 'currentStreak',
    currentTier: 0,
    icon: '🔥',
    tiers: [
      { level: 1, requirement: 3, reward: 'Bronze Trophy', progress: 0, unlocked: false, unlockedAt: null },
      { level: 2, requirement: 7, reward: 'Silver Trophy', progress: 0, unlocked: false, unlockedAt: null },
      { level: 3, requirement: 14, reward: 'Gold Trophy', progress: 0, unlocked: false, unlockedAt: null }
    ]
  },
  {
    id: 'consistencyKing',
    title: 'Consistency King',
    description: 'Complete multiple sessions',
    metric: 'completedSessions',
    currentTier: 0,
    icon: '👑',
    tiers: [
      { level: 1, requirement: 10, reward: 'Daily Tracker', progress: 0, unlocked: false, unlockedAt: null },
      { level: 2, requirement: 20, reward: 'Weekly Insights', progress: 0, unlocked: false, unlockedAt: null },
      { level: 3, requirement: 30, reward: 'Monthly Report', progress: 0, unlocked: false, unlockedAt: null }
    ]
  },
  {
    id: 'dailyDedication',
    title: 'Daily Dedication',
    description: 'Complete sessions in a single day',
    metric: 'dailySessions',
    currentTier: 0,
    icon: '📅',
    tiers: [
      { level: 1, requirement: 3, reward: 'Focus Booster', progress: 0, unlocked: false, unlockedAt: null },
      { level: 2, requirement: 5, reward: 'Productivity Pack', progress: 0, unlocked: false, unlockedAt: null },
      { level: 3, requirement: 7, reward: 'Time Master Badge', progress: 0, unlocked: false, unlockedAt: null }
    ]
  },
  {
    id: 'weeklyWarrior',
    title: 'Weekly Warrior',
    description: 'Complete sessions in a single week',
    metric: 'weeklySessions',
    currentTier: 0,
    icon: '🗓️',
    tiers: [
      { level: 1, requirement: 10, reward: 'Weekly Planner', progress: 0, unlocked: false, unlockedAt: null },
      { level: 2, requirement: 20, reward: 'Efficiency Expert', progress: 0, unlocked: false, unlockedAt: null },
      { level: 3, requirement: 30, reward: 'Productivity Champion', progress: 0, unlocked: false, unlockedAt: null }
    ]
  }
];

// Default stats
const defaultStats: UserStats = {
  totalSessions: 0,
  completedSessions: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalFocusTime: 0,
  dailyStats: [],
  sessionHistory: [],
  achievements: defaultAchievements,
  lastAchievementCheck: null
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
  checkAchievements: () => Achievement[];
  getUnlockedAchievements: () => Achievement[];
  getAchievementProgress: (achievementId: string) => number;
  getNextAchievement: (achievementId: string) => AchievementTier | null;
  fastForwardSessions: (numSessions: number, focusTimePerSession: number) => void;
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
    
    // Check for achievements
    const newAchievements = checkAchievements();
    
    // Notify about new achievements
    if (newAchievements.length > 0) {
      setTimeout(() => {
        newAchievements.forEach(achievement => {
          const tier = achievement.tiers[achievement.currentTier - 1];
          if (tier) {
            // We'll handle this notification in the UI
            console.log(`Achievement unlocked: ${achievement.title} - Level ${tier.level}`);
          }
        });
      }, 1000); // Delay to ensure the session completion notification shows first
    }
    
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

  // Achievement system methods
  const checkAchievements = (): Achievement[] => {
    const now = new Date().toISOString();
    const unlockedAchievements: Achievement[] = [];
    
    setStats(prev => {
      const updatedAchievements = [...prev.achievements];
      
      // Process each achievement
      updatedAchievements.forEach(achievement => {
        // Get the current progress value based on the metric
        let currentValue = 0;
        
        switch (achievement.metric) {
          case 'totalFocusTime':
            // Sum up all completed focus time
            currentValue = prev.dailyStats.reduce((total, day) => total + day.totalFocusTime, 0);
            break;
          case 'currentStreak':
            currentValue = prev.currentStreak;
            break;
          case 'completedSessions':
            currentValue = prev.completedSessions;
            break;
          case 'dailySessions': {
            // Get today's date in YYYY-MM-DD format
            const today = new Date().toISOString().split('T')[0];
            // Find today's stats
            const todayStats = prev.dailyStats.find(day => day.date === today);
            currentValue = todayStats ? todayStats.completedSessions : 0;
            break;
          }
          case 'weeklySessions': {
            // Get the start of the current week (Sunday)
            const now = new Date();
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            
            // Count sessions in the current week
            currentValue = prev.sessionHistory.filter(session => {
              const sessionDate = new Date(session.startTime);
              return sessionDate >= startOfWeek && session.completed;
            }).length;
            break;
          }
        }
        
        // Special handling for Daily Dedication achievement
        if (achievement.id === 'dailyDedication') {
          // For Daily Dedication, we want progressive unlocking where:
          // Level 1: 3 sessions
          // Level 2: 5 sessions (3+2)
          // Level 3: 7 sessions (3+2+2)
          
          // Update progress for each tier based on current value
          for (let i = 0; i < achievement.tiers.length; i++) {
            const tier = achievement.tiers[i];
            tier.progress = Math.min(currentValue, tier.requirement);
            
            // Check if this tier should be unlocked
            if (!tier.unlocked && currentValue >= tier.requirement) {
              tier.unlocked = true;
              tier.unlockedAt = now;
              achievement.currentTier = Math.max(achievement.currentTier, i + 1);
              
              // Add to the list of newly unlocked achievements
              if (!unlockedAchievements.includes(achievement)) {
                unlockedAchievements.push(achievement);
              }
            }
          }
        } else {
          // Standard achievement handling for other achievements
          for (let i = 0; i < achievement.tiers.length; i++) {
            const tier = achievement.tiers[i];
            
            // Update progress
            tier.progress = Math.min(currentValue, tier.requirement);
            
            // Check if this tier should be unlocked
            if (!tier.unlocked && currentValue >= tier.requirement) {
              tier.unlocked = true;
              tier.unlockedAt = now;
              achievement.currentTier = Math.max(achievement.currentTier, i + 1);
              
              // Add to the list of newly unlocked achievements
              if (!unlockedAchievements.includes(achievement)) {
                unlockedAchievements.push(achievement);
              }
            }
          }
        }
      });
      
      return {
        ...prev,
        achievements: updatedAchievements,
        lastAchievementCheck: now
      };
    });
    
    return unlockedAchievements;
  };
  
  const getUnlockedAchievements = (): Achievement[] => {
    return stats.achievements.filter(achievement => 
      achievement.tiers.some(tier => tier.unlocked)
    );
  };
  
  const getAchievementProgress = (achievementId: string): number => {
    const achievement = stats.achievements.find(a => a.id === achievementId);
    if (!achievement) return 0;
    
    const currentTierIndex = achievement.currentTier;
    const nextTierIndex = currentTierIndex < achievement.tiers.length - 1 
      ? currentTierIndex + 1 
      : achievement.tiers.length - 1;
    
    // Get the next tier for progress calculation
    const nextTier = achievement.tiers[nextTierIndex];
    
    if (!nextTier) return 100; // All tiers completed
    
    // Calculate progress percentage toward next tier
    let currentValue = 0;
    switch (achievement.metric) {
      case 'totalFocusTime':
        currentValue = stats.dailyStats.reduce((total, day) => total + day.totalFocusTime, 0);
        break;
      case 'currentStreak':
        currentValue = stats.currentStreak;
        break;
      case 'completedSessions':
        currentValue = stats.completedSessions;
        break;
      case 'dailySessions': {
        const today = new Date().toISOString().split('T')[0];
        const todayStats = stats.dailyStats.find(day => day.date === today);
        currentValue = todayStats ? todayStats.completedSessions : 0;
        break;
      }
      case 'weeklySessions': {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        
        currentValue = stats.sessionHistory.filter(session => {
          const sessionDate = new Date(session.startTime);
          return sessionDate >= startOfWeek && session.completed;
        }).length;
        break;
      }
    }
    
    // Special handling for Daily Dedication achievement
    if (achievement.id === 'dailyDedication') {
      // For Daily Dedication, we need to calculate progress differently
      // Level 1: 0-3 sessions
      // Level 2: 3-5 sessions
      // Level 3: 5-7 sessions
      
      // If all tiers are completed
      if (currentTierIndex >= achievement.tiers.length) {
        return 100;
      }
      
      // Calculate progress based on the current tier
      if (currentTierIndex === 0) { // Working toward first tier (0-3)
        return Math.min(Math.floor((currentValue / 3) * 100), 100);
      } else if (currentTierIndex === 1) { // Working toward second tier (3-5)
        return Math.min(Math.floor(((currentValue - 3) / 2) * 100), 100);
      } else if (currentTierIndex === 2) { // Working toward third tier (5-7)
        return Math.min(Math.floor(((currentValue - 5) / 2) * 100), 100);
      }
      
      return 100; // Fallback
    }
    
    // Standard progress calculation for other achievements
    // If we're between tiers, calculate progress toward the next tier
    if (currentTierIndex < achievement.tiers.length - 1) {
      const prevRequirement = currentTierIndex > 0 
        ? achievement.tiers[currentTierIndex].requirement 
        : 0;
      const nextRequirement = nextTier.requirement;
      const adjustedValue = currentValue - prevRequirement;
      const adjustedTotal = nextRequirement - prevRequirement;
      
      return Math.min(Math.floor((adjustedValue / adjustedTotal) * 100), 100);
    }
    
    return 100; // All tiers completed
  };
  
  const getNextAchievement = (achievementId: string): AchievementTier | null => {
    const achievement = stats.achievements.find(a => a.id === achievementId);
    if (!achievement) return null;
    
    // Find the next locked tier
    const nextTier = achievement.tiers.find(tier => !tier.unlocked);
    return nextTier || null;
  };

  // Fast forward function for testing achievements
  const fastForwardSessions = (numSessions: number, focusTimePerSession: number) => {
    // Create a copy of the current stats
    const newStats = { ...stats };
    const today = new Date().toISOString().split('T')[0];
    
    // Find or create today's stats
    let todayStats = newStats.dailyStats.find(day => day.date === today);
    if (!todayStats) {
      todayStats = {
        date: today,
        completedSessions: 0,
        totalFocusTime: 0,
        totalPauseTime: 0
      };
      newStats.dailyStats.push(todayStats);
    }
    
    // Update stats
    newStats.completedSessions += numSessions;
    newStats.totalSessions += numSessions;
    newStats.totalFocusTime += numSessions * focusTimePerSession;
    
    // Update today's stats
    todayStats.completedSessions += numSessions;
    todayStats.totalFocusTime += numSessions * focusTimePerSession;
    
    // Create simulated session history entries
    for (let i = 0; i < numSessions; i++) {
      const startTime = new Date();
      startTime.setMinutes(startTime.getMinutes() - (i + 1) * 30); // Stagger start times
      
      const targetEndTime = new Date(startTime);
      targetEndTime.setSeconds(targetEndTime.getSeconds() + focusTimePerSession);
      
      const sessionId = `test-${Date.now()}-${i}`;
      const newSession: SessionData = {
        id: sessionId,
        type: 'pomodoro',
        startTime: startTime.toISOString(),
        endTime: targetEndTime.toISOString(),
        targetEndTime: targetEndTime.toISOString(),
        duration: focusTimePerSession,
        pausedAt: null,
        totalPausedTime: 0,
        completed: true
      };
      
      newStats.sessionHistory.push(newSession);
    }
    
    // Update streak if needed
    if (newStats.currentStreak === 0) {
      newStats.currentStreak = 1;
      if (newStats.longestStreak < 1) {
        newStats.longestStreak = 1;
      }
    }
    
    // Save updated stats
    setStats(newStats);
    localStorage.setItem('focusTimerStats', JSON.stringify(newStats));
    
    // Check achievements with the new stats
    checkAchievements();
  };

  return (
    <DataContext.Provider value={{
      stats,
      currentSession,
      startSession,
      pauseSession,
      fastForwardSessions,
      resumeSession,
      completeSession,
      cancelSession,
      resetStats,
      checkAchievements,
      getUnlockedAchievements,
      getAchievementProgress,
      getNextAchievement
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
