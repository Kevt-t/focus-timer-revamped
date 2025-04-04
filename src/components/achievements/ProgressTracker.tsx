import React from 'react';
import { useData } from '../../context/DataContext';
import { Achievement } from '../../context/DataContext';

const ProgressTracker: React.FC = () => {
  const { stats, getAchievementProgress } = useData();
  
  // Get achievements with progress
  const achievementsWithProgress = stats.achievements.map(achievement => ({
    ...achievement,
    progressPercent: getAchievementProgress(achievement.id)
  }));
  
  // Sort by progress (highest first)
  const sortedAchievements = [...achievementsWithProgress].sort(
    (a, b) => b.progressPercent - a.progressPercent
  );
  
  // Get the top 3 achievements that are in progress but not completed
  const upcomingAchievements = sortedAchievements
    .filter(a => a.progressPercent > 0 && a.progressPercent < 100)
    .slice(0, 3);
  
  // Get recently unlocked achievements (last 3)
  const getRecentlyUnlocked = (): Achievement[] => {
    const unlocked = stats.achievements
      .filter(achievement => achievement.tiers.some(tier => tier.unlocked))
      .map(achievement => {
        // Find the most recently unlocked tier
        const latestUnlockedTier = [...achievement.tiers]
          .filter(tier => tier.unlocked)
          .sort((a, b) => {
            if (!a.unlockedAt || !b.unlockedAt) return 0;
            return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
          })[0];
          
        return {
          ...achievement,
          latestUnlock: latestUnlockedTier?.unlockedAt || ''
        };
      })
      .sort((a, b) => new Date(b.latestUnlock).getTime() - new Date(a.latestUnlock).getTime())
      .slice(0, 3);
      
    return unlocked;
  };
  
  const recentlyUnlocked = getRecentlyUnlocked();
  
  return (
    <div className="progress-tracker bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold mb-4 dark:text-white">Achievement Progress</h2>
      
      {/* Upcoming achievements */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 dark:text-white">Upcoming Achievements</h3>
        {upcomingAchievements.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No achievements in progress.</p>
        ) : (
          <div className="space-y-3">
            {upcomingAchievements.map(achievement => {
              // Find the next tier to unlock
              const nextTier = achievement.tiers.find(tier => !tier.unlocked);
              
              return (
                <div key={achievement.id} className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="flex items-center mb-1">
                    <span className="text-xl mr-2">{achievement.icon}</span>
                    <div>
                      <h4 className="font-medium dark:text-white">{achievement.title}</h4>
                      {nextTier && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Next: Level {nextTier.level} - {nextTier.reward}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-gray-200 dark:bg-gray-600">
                      <div 
                        style={{ width: `${achievement.progressPercent}%` }} 
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 dark:bg-blue-400"
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{achievement.progressPercent}% complete</span>
                      {nextTier && (
                        <span>{nextTier.requirement} {getMetricLabel(achievement.metric)} required</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Recently unlocked */}
      <div>
        <h3 className="text-lg font-semibold mb-2 dark:text-white">Recent Milestones</h3>
        {recentlyUnlocked.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No achievements unlocked yet.</p>
        ) : (
          <div className="space-y-2">
            {recentlyUnlocked.map(achievement => {
              // Get the highest unlocked tier
              const highestUnlockedTier = [...achievement.tiers]
                .filter(tier => tier.unlocked)
                .sort((a, b) => b.level - a.level)[0];
              
              return (
                <div key={achievement.id} className="flex items-center p-2 bg-green-100 dark:bg-green-900 dark:bg-opacity-30 rounded-lg">
                  <div className="bg-green-500 text-white p-2 rounded-full mr-3">
                    <span className="text-lg">{achievement.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-medium dark:text-white">{achievement.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-green-300">
                      Level {highestUnlockedTier.level} - {highestUnlockedTier.reward}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Unlocked {formatDate(highestUnlockedTier.unlockedAt!)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to get a human-readable label for the metric
const getMetricLabel = (metric: string): string => {
  switch (metric) {
    case 'totalFocusTime': return 'minutes';
    case 'currentStreak': return 'days';
    case 'completedSessions': return 'sessions';
    case 'dailySessions': return 'sessions today';
    case 'weeklySessions': return 'sessions this week';
    default: return 'units';
  }
};

// Helper function to format a date in a human-readable way
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  
  // If it's today, show "Today at HH:MM"
  if (date.toDateString() === now.toDateString()) {
    return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // If it's yesterday, show "Yesterday at HH:MM"
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // Otherwise, show the date
  return date.toLocaleDateString([], { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

export default ProgressTracker;
