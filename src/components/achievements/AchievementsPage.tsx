import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import AchievementList from './AchievementList';
import ProgressTracker from './ProgressTracker';
import UnlockAnimation from './UnlockAnimation';
import { Achievement, AchievementTier } from '../../context/DataContext';

const AchievementsPage: React.FC = () => {
  const { stats } = useData();
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [newAchievement, setNewAchievement] = useState<{achievement: Achievement, tier: AchievementTier} | null>(null);
  
  // Set filter based on URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#achievements/unlocked') {
        setFilter('unlocked');
      } else if (hash === '#achievements/locked') {
        setFilter('locked');
      } else {
        setFilter('all');
      }
    };
    
    // Set initial filter
    handleHashChange();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  // Check for newly unlocked achievements to show animation
  useEffect(() => {
    // This would normally be triggered by an event system
    // For demo purposes, we'll simulate a new achievement unlock
    const checkForNewAchievements = () => {
      // Find an achievement with at least one unlocked tier
      const unlockedAchievements = stats.achievements.filter(
        achievement => achievement.tiers.some(tier => tier.unlocked)
      );
      
      if (unlockedAchievements.length > 0) {
        const achievement = unlockedAchievements[0];
        const tier = achievement.tiers.find(tier => tier.unlocked);
        
        if (tier) {
          // In a real implementation, we would check if this is newly unlocked
          // For demo purposes, we'll only show this once when the page loads
          setNewAchievement({ achievement, tier });
        }
      }
    };
    
    // Only check once when the component mounts
    const hasChecked = sessionStorage.getItem('achievementAnimationShown');
    if (!hasChecked) {
      checkForNewAchievements();
      sessionStorage.setItem('achievementAnimationShown', 'true');
    }
  }, [stats.achievements]);
  
  return (
    <div className="achievements-page p-4">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Achievements</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AchievementList filter={filter} />
        </div>
        
        <div className="lg:col-span-1">
          <ProgressTracker />
        </div>
      </div>
      
      {newAchievement && (
        <UnlockAnimation 
          achievement={newAchievement.achievement}
          tier={newAchievement.tier}
          onClose={() => setNewAchievement(null)}
        />
      )}
    </div>
  );
};

export default AchievementsPage;
