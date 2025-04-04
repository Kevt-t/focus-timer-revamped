import React from 'react';
import { useData } from '../../context/DataContext';
import { Link } from 'react-router-dom';

const ProgressOverview: React.FC = () => {
  const { stats, getUnlockedAchievements, getAchievementProgress } = useData();
  
  // Get unlocked achievements
  const unlockedAchievements = getUnlockedAchievements();
  
  // Get achievements in progress (not fully completed)
  const achievementsInProgress = stats.achievements.filter(achievement => {
    const hasUnlockedTiers = achievement.tiers.some(tier => tier.unlocked);
    const hasLockedTiers = achievement.tiers.some(tier => !tier.unlocked);
    return hasUnlockedTiers && hasLockedTiers;
  });
  
  // Get upcoming achievements (no tiers unlocked yet, but have progress)
  const upcomingAchievements = stats.achievements.filter(achievement => {
    const hasUnlockedTiers = achievement.tiers.some(tier => tier.unlocked);
    const progress = getAchievementProgress(achievement.id);
    return !hasUnlockedTiers && progress > 0;
  });
  
  // Calculate overall achievement progress
  const totalTiers = stats.achievements.reduce(
    (total, achievement) => total + achievement.tiers.length, 
    0
  );
  
  const unlockedTiers = stats.achievements.reduce(
    (total, achievement) => total + achievement.tiers.filter(tier => tier.unlocked).length, 
    0
  );
  
  const overallProgress = totalTiers > 0 
    ? Math.round((unlockedTiers / totalTiers) * 100) 
    : 0;
  
  return (
    <div className="progress-overview bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold dark:text-white">Progress Overview</h2>
        <Link 
          to="/achievements" 
          className="text-blue-500 hover:text-blue-600 text-sm"
        >
          View All
        </Link>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-lg font-semibold dark:text-white">Overall Achievement Progress</h3>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {unlockedTiers}/{totalTiers} tiers unlocked
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
          <div 
            className="bg-blue-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-100 dark:bg-green-900 dark:bg-opacity-30 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">Unlocked</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{unlockedAchievements.length}</p>
          <p className="text-sm text-green-700 dark:text-green-300">achievements</p>
        </div>
        
        <div className="bg-blue-100 dark:bg-blue-900 dark:bg-opacity-30 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">In Progress</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{achievementsInProgress.length}</p>
          <p className="text-sm text-blue-700 dark:text-blue-300">achievements</p>
        </div>
        
        <div className="bg-purple-100 dark:bg-purple-900 dark:bg-opacity-30 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-2">Upcoming</h3>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{upcomingAchievements.length}</p>
          <p className="text-sm text-purple-700 dark:text-purple-300">achievements</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 dark:text-white">Current Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">Focus Sessions</p>
            <p className="text-xl font-bold dark:text-white">{stats.completedSessions}</p>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">Current Streak</p>
            <p className="text-xl font-bold dark:text-white">{stats.currentStreak} days</p>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">Longest Streak</p>
            <p className="text-xl font-bold dark:text-white">{stats.longestStreak} days</p>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Focus Time</p>
            <p className="text-xl font-bold dark:text-white">
              {formatTime(stats.dailyStats.reduce((total, day) => total + day.totalFocusTime, 0))}
            </p>
          </div>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold dark:text-white">Motivational Quote</h3>
          <button 
            className="text-blue-500 hover:text-blue-600 text-sm"
            onClick={() => {
              // Refresh quote (would normally fetch from API)
              const quoteElement = document.getElementById('motivational-quote');
              if (quoteElement) {
                quoteElement.textContent = getRandomQuote();
              }
            }}
          >
            Refresh
          </button>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 italic text-center">
          <p id="motivational-quote" className="text-gray-700 dark:text-gray-300">
            {getRandomQuote()}
          </p>
        </div>
      </div>
    </div>
  );
};

// Helper function to format time
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

// Helper function to get a random motivational quote
const getRandomQuote = (): string => {
  const quotes = [
    "The secret of getting ahead is getting started.",
    "Don't watch the clock; do what it does. Keep going.",
    "The way to get started is to quit talking and begin doing.",
    "It always seems impossible until it's done.",
    "You don't have to be great to start, but you have to start to be great.",
    "Focus on being productive instead of busy.",
    "The most effective way to do it, is to do it.",
    "Productivity is never an accident. It is always the result of a commitment to excellence.",
    "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
    "Amateurs sit and wait for inspiration, the rest of us just get up and go to work."
  ];
  
  return quotes[Math.floor(Math.random() * quotes.length)];
};

export default ProgressOverview;
