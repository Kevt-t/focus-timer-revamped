import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import AchievementCard from './AchievementCard';
import { Achievement } from '../../context/DataContext';

interface AchievementListProps {
  filter?: 'all' | 'unlocked' | 'locked';
}

const AchievementList: React.FC<AchievementListProps> = ({ filter = 'all' }) => {
  const { stats } = useData();
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  
  // Filter achievements based on the selected filter
  const filteredAchievements = stats.achievements.filter(achievement => {
    if (filter === 'all') return true;
    
    const hasUnlockedTiers = achievement.tiers.some(tier => tier.unlocked);
    if (filter === 'unlocked') return hasUnlockedTiers;
    if (filter === 'locked') return !hasUnlockedTiers;
    
    return true;
  });
  
  const handleAchievementClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement === selectedAchievement ? null : achievement);
  };
  
  return (
    <div className="achievement-list">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold dark:text-white">Achievements</h2>
        <div className="flex space-x-2">
          <button 
            className={`px-3 py-1 text-sm rounded-full ${
              filter === 'all' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
            onClick={() => window.location.hash = '#achievements/all'}
          >
            All
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-full ${
              filter === 'unlocked' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
            onClick={() => window.location.hash = '#achievements/unlocked'}
          >
            Unlocked
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-full ${
              filter === 'locked' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
            onClick={() => window.location.hash = '#achievements/locked'}
          >
            Locked
          </button>
        </div>
      </div>
      
      {filteredAchievements.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No achievements found for the selected filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAchievements.map(achievement => (
            <AchievementCard 
              key={achievement.id} 
              achievement={achievement}
              onClick={handleAchievementClick}
              showDetails={selectedAchievement?.id === achievement.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AchievementList;
