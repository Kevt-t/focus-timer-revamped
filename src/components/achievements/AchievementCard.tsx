import React, { useState } from 'react';
import { Achievement, AchievementTier } from '../../context/DataContext';
import { useData } from '../../context/DataContext';

interface AchievementCardProps {
  achievement: Achievement;
  onClick?: (achievement: Achievement) => void;
  showDetails?: boolean;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ 
  achievement, 
  onClick,
  showDetails = false
}) => {
  const { getAchievementProgress, getNextAchievement } = useData();
  const [expanded, setExpanded] = useState(showDetails);
  
  const progress = getAchievementProgress(achievement.id);
  const nextTier = getNextAchievement(achievement.id);
  
  // Get the current unlocked tier (if any)
  const currentTier = achievement.tiers.find((tier, index) => 
    index === achievement.currentTier - 1
  );
  
  // Determine the badge color based on the current tier
  const getBadgeColor = () => {
    if (!currentTier) return 'bg-gray-300 dark:bg-gray-600'; // Not unlocked yet
    
    switch (currentTier.level) {
      case 1: return 'bg-amber-600'; // Bronze
      case 2: return 'bg-gray-400'; // Silver
      case 3: return 'bg-yellow-400'; // Gold
      default: return 'bg-purple-500'; // Higher levels
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(achievement);
    } else {
      setExpanded(!expanded);
    }
  };

  return (
    <div 
      className={`achievement-card bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 ${
        expanded ? 'max-h-96' : 'max-h-32'
      }`}
      onClick={handleClick}
    >
      <div className="p-4 cursor-pointer flex items-center">
        <div className={`${getBadgeColor()} text-white p-3 rounded-full mr-4 flex-shrink-0`}>
          <span className="text-2xl">{achievement.icon}</span>
        </div>
        
        <div className="flex-grow">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold dark:text-white">{achievement.title}</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {currentTier 
                ? `Level ${currentTier.level}/${achievement.tiers.length}` 
                : 'Locked'}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{achievement.description}</p>
          
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200 dark:text-blue-200 dark:bg-blue-800">
                  {nextTier 
                    ? `Progress to Level ${nextTier.level}` 
                    : 'Completed'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-blue-600 dark:text-blue-300">
                  {progress}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200 dark:bg-gray-700">
              <div 
                style={{ width: `${progress}%` }} 
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 dark:bg-blue-400 transition-all duration-500"
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      {expanded && (
        <div className="px-4 pb-4 pt-0">
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <h4 className="text-md font-medium mb-2 dark:text-white">Achievement Tiers</h4>
            <div className="space-y-2">
              {achievement.tiers.map((tier, index) => (
                <div 
                  key={index} 
                  className={`p-2 rounded ${
                    tier.unlocked 
                      ? 'bg-green-100 dark:bg-green-900 dark:bg-opacity-30' 
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      {tier.unlocked && (
                        <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span className={`font-medium ${tier.unlocked ? 'dark:text-green-300' : 'dark:text-white'}`}>
                        Level {tier.level}: {tier.reward}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {tier.unlocked 
                        ? `Unlocked ${new Date(tier.unlockedAt!).toLocaleDateString()}` 
                        : `Requires ${tier.requirement} ${getMetricLabel(achievement.metric)}`}
                    </span>
                  </div>
                  {!tier.unlocked && (
                    <div className="mt-1 overflow-hidden h-1 text-xs flex rounded bg-gray-200 dark:bg-gray-600">
                      <div 
                        style={{ width: `${Math.min(Math.floor((tier.progress / tier.requirement) * 100), 100)}%` }} 
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 dark:bg-blue-400"
                      ></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
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

export default AchievementCard;
