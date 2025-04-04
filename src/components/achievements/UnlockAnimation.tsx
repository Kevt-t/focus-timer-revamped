import React, { useState, useEffect } from 'react';
import { Achievement, AchievementTier } from '../../context/DataContext';

interface UnlockAnimationProps {
  achievement: Achievement;
  tier: AchievementTier;
  onClose: () => void;
}

const UnlockAnimation: React.FC<UnlockAnimationProps> = ({ achievement, tier, onClose }) => {
  const [animationState, setAnimationState] = useState<'entering' | 'visible' | 'exiting'>('entering');
  
  useEffect(() => {
    // Show the animation for a few seconds, then exit
    const visibleTimer = setTimeout(() => {
      setAnimationState('visible');
    }, 500);
    
    const exitTimer = setTimeout(() => {
      setAnimationState('exiting');
    }, 4000);
    
    const closeTimer = setTimeout(() => {
      onClose();
    }, 4500);
    
    return () => {
      clearTimeout(visibleTimer);
      clearTimeout(exitTimer);
      clearTimeout(closeTimer);
    };
  }, [onClose]);
  
  // Determine badge color based on tier level
  const getBadgeColor = () => {
    switch (tier.level) {
      case 1: return 'bg-amber-600'; // Bronze
      case 2: return 'bg-gray-400'; // Silver
      case 3: return 'bg-yellow-400'; // Gold
      default: return 'bg-purple-500'; // Higher levels
    }
  };
  
  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-500 ${
        animationState === 'entering' 
          ? 'opacity-0' 
          : animationState === 'exiting' 
            ? 'opacity-0' 
            : 'opacity-100'
      }`}
    >
      <div className="absolute inset-0 bg-black bg-opacity-70" onClick={onClose}></div>
      
      <div 
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4 relative transform transition-transform duration-500 ${
          animationState === 'entering' 
            ? 'scale-50' 
            : animationState === 'exiting' 
              ? 'scale-110' 
              : 'scale-100'
        }`}
      >
        <div className="text-center">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center">
              <div className={`${getBadgeColor()} text-white p-5 rounded-full mb-2 animate-pulse`}>
                <span className="text-4xl">{achievement.icon}</span>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-20"></div>
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-2 dark:text-white">Achievement Unlocked!</h2>
          <h3 className="text-xl font-semibold mb-4 dark:text-white">{achievement.title}</h3>
          
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <p className="text-lg font-medium dark:text-white">Level {tier.level}</p>
            <p className="text-gray-600 dark:text-gray-300">{tier.reward}</p>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">{achievement.description}</p>
          
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-300"
            onClick={onClose}
          >
            Awesome!
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnlockAnimation;
