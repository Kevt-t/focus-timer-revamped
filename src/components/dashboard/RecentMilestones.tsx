import React from 'react';
import { useData } from '../../context/DataContext';

interface RecentMilestone {
  type: 'achievement' | 'streak' | 'session';
  title: string;
  description: string;
  icon: string;
  date: string;
  color: string;
}

const RecentMilestones: React.FC = () => {
  const { stats } = useData();
  
  // Get recently unlocked achievement tiers
  const getRecentAchievements = (): RecentMilestone[] => {
    const recentAchievements: RecentMilestone[] = [];
    
    stats.achievements.forEach(achievement => {
      achievement.tiers
        .filter(tier => tier.unlocked && tier.unlockedAt)
        .forEach(tier => {
          recentAchievements.push({
            type: 'achievement',
            title: `${achievement.title} - Level ${tier.level}`,
            description: tier.reward,
            icon: achievement.icon,
            date: tier.unlockedAt!,
            color: getBadgeColor(tier.level)
          });
        });
    });
    
    // Sort by date (newest first)
    return recentAchievements.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };
  
  // Get recent streak milestones
  const getRecentStreakMilestones = (): RecentMilestone[] => {
    // We'll consider streak milestones at 3, 7, 14, 30, 60, 90 days
    const streakMilestones = [3, 7, 14, 30, 60, 90];
    const recentStreakMilestones: RecentMilestone[] = [];
    
    // Get completed sessions sorted by date (newest first)
    const completedSessions = [...stats.sessionHistory]
      .filter(session => session.completed)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    
    if (completedSessions.length === 0) return [];
    
    // Check if current streak hits any milestones
    streakMilestones.forEach(milestone => {
      if (stats.currentStreak >= milestone) {
        // Find the session that would have completed this milestone
        // This is approximate since we don't store the exact streak history
        const sessionsToLookBack = Math.min(completedSessions.length - 1, 5);
        const recentSession = completedSessions[sessionsToLookBack];
        
        recentStreakMilestones.push({
          type: 'streak',
          title: `${milestone}-Day Streak`,
          description: `Maintained focus for ${milestone} consecutive days`,
          icon: '🔥',
          date: recentSession.endTime || recentSession.startTime,
          color: 'bg-orange-500'
        });
      }
    });
    
    return recentStreakMilestones;
  };
  
  // Get session milestones (every 10 sessions)
  const getSessionMilestones = (): RecentMilestone[] => {
    const sessionMilestones: RecentMilestone[] = [];
    const sessionCountMilestones = [10, 25, 50, 100, 250, 500];
    
    // Get completed sessions sorted by date (newest first)
    const completedSessions = [...stats.sessionHistory]
      .filter(session => session.completed)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    
    sessionCountMilestones.forEach(milestone => {
      if (stats.completedSessions >= milestone) {
        // Find the session that would have completed this milestone
        const milestoneSession = completedSessions[completedSessions.length - milestone];
        if (milestoneSession) {
          sessionMilestones.push({
            type: 'session',
            title: `${milestone} Sessions Completed`,
            description: `Completed ${milestone} focus sessions`,
            icon: '🎯',
            date: milestoneSession.endTime || milestoneSession.startTime,
            color: 'bg-blue-500'
          });
        }
      }
    });
    
    return sessionMilestones;
  };
  
  // Combine all milestones and sort by date
  const allMilestones = [
    ...getRecentAchievements(),
    ...getRecentStreakMilestones(),
    ...getSessionMilestones()
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Take the 10 most recent milestones
  const recentMilestones = allMilestones.slice(0, 10);
  
  return (
    <div className="recent-milestones bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold mb-4 dark:text-white">Recent Milestones</h2>
      
      {recentMilestones.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No milestones achieved yet. Start a focus session to earn your first milestone!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentMilestones.map((milestone, index) => (
            <div 
              key={index} 
              className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className={`${milestone.color} text-white p-2 rounded-full mr-3`}>
                <span className="text-lg">{milestone.icon}</span>
              </div>
              <div className="flex-grow">
                <h3 className="font-medium dark:text-white">{milestone.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{milestone.description}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(milestone.date)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper function to get badge color based on tier level
const getBadgeColor = (level: number): string => {
  switch (level) {
    case 1: return 'bg-amber-600'; // Bronze
    case 2: return 'bg-gray-400'; // Silver
    case 3: return 'bg-yellow-400'; // Gold
    default: return 'bg-purple-500'; // Higher levels
  }
};

// Helper function to format a date in a human-readable way
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  
  // If it's today, show "Today"
  if (date.toDateString() === now.toDateString()) {
    return 'Today';
  }
  
  // If it's yesterday, show "Yesterday"
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  
  // If it's within the last 7 days, show the day name
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(now.getDate() - 7);
  if (date >= oneWeekAgo) {
    return date.toLocaleDateString([], { weekday: 'long' });
  }
  
  // Otherwise, show the date
  return date.toLocaleDateString([], { 
    month: 'short', 
    day: 'numeric' 
  });
};

export default RecentMilestones;
