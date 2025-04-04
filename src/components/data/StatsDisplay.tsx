import React from 'react';
import { useData } from '../../context/DataContext';

const StatsDisplay: React.FC = () => {
  const { stats } = useData();
  
  // Calculate today's stats
  const today = new Date().toISOString().split('T')[0];
  const todayStats = stats.dailyStats.find(day => day.date === today) || {
    date: today,
    completedSessions: 0,
    totalFocusTime: 0,
    totalPauseTime: 0
  };
  
  // Format time (seconds) to hours, minutes, and seconds
  const formatTime = (seconds: number): string => {
    if (seconds === 0) return '0m';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m${secs > 0 ? ' ' + secs + 's' : ''}`;
    }
    return `${secs}s`;
  };

  return (
    <div className="stats-display p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 dark:text-white">Your Progress</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="stat-card p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <div className="text-sm text-blue-500 dark:text-blue-300">Today's Sessions</div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-100">{todayStats.completedSessions}</div>
        </div>
        
        <div className="stat-card p-3 bg-green-50 dark:bg-green-900 rounded-lg">
          <div className="text-sm text-green-500 dark:text-green-300">Today's Focus Time</div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-100">{formatTime(todayStats.totalFocusTime)}</div>
        </div>
        
        <div className="stat-card p-3 bg-red-50 dark:bg-red-900 rounded-lg">
          <div className="text-sm text-red-500 dark:text-red-300">Today's Pause Time</div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-100">
            {formatTime(todayStats.totalPauseTime)}
            {todayStats.totalPauseTime === 0 && <span className="text-xs ml-2">(No pauses)</span>}
          </div>
        </div>
        
        <div className="stat-card p-3 bg-indigo-50 dark:bg-indigo-900 rounded-lg">
          <div className="text-sm text-indigo-500 dark:text-indigo-300">Focus/Pause Ratio</div>
          <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-100">
            {todayStats.totalPauseTime > 0 
              ? (todayStats.totalFocusTime / todayStats.totalPauseTime).toFixed(1) + ':1'
              : '∞'}
            {todayStats.totalPauseTime === 0 && todayStats.totalFocusTime > 0 && 
              <span className="text-xs ml-2">(Perfect focus)</span>}
          </div>
        </div>
        
        <div className="stat-card p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
          <div className="text-sm text-purple-500 dark:text-purple-300">Current Streak</div>
          <div className="text-2xl font-bold text-purple-700 dark:text-purple-100">{stats.currentStreak} days</div>
        </div>
        
        <div className="stat-card p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
          <div className="text-sm text-yellow-500 dark:text-yellow-300">Longest Streak</div>
          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-100">{stats.longestStreak} days</div>
        </div>
      </div>
      
      <div className="total-stats p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Completed</div>
            <div className="text-xl font-bold dark:text-white">{stats.completedSessions} sessions</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">Completion Rate</div>
            <div className="text-xl font-bold dark:text-white">
              {stats.totalSessions > 0 
                ? Math.round((stats.completedSessions / stats.totalSessions) * 100) 
                : 0}%
            </div>
          </div>
        </div>
        
        {/* Focus vs Pause Time Visualization */}
        <div className="mt-4">
          <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Today's Focus vs. Pause Time</h4>
          <div className="relative h-6 bg-yellow-400 dark:bg-yellow-600 rounded-full overflow-hidden">
            {todayStats.totalFocusTime > 0 || todayStats.totalPauseTime > 0 ? (
              <>
                <div 
                  className="absolute top-0 left-0 h-full bg-green-500 dark:bg-green-600"
                  style={{
                    width: `${(todayStats.totalFocusTime / (todayStats.totalFocusTime + todayStats.totalPauseTime)) * 100}%`
                  }}
                ></div>
                <div className="absolute top-0 left-0 h-full w-full flex justify-between items-center px-2">
                  <span className="text-xs font-medium text-white z-10">
                    Focus: {formatTime(todayStats.totalFocusTime)}
                  </span>
                  <span className="text-xs font-medium text-white z-10">
                    Pause: {formatTime(todayStats.totalPauseTime)}
                    {todayStats.totalPauseTime === 0 && <span className="ml-1">(None)</span>}
                  </span>
                </div>
              </>
            ) : (
              <div className="absolute top-0 left-0 h-full w-full flex justify-center items-center">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">No data yet</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {stats.dailyStats.length > 0 && (
        <div className="recent-activity mt-4">
          <h3 className="text-lg font-medium mb-2 dark:text-white">Recent Activity</h3>
          <div className="max-h-40 overflow-y-auto">
            {stats.dailyStats.slice(0, 7).map(day => (
              <div key={day.date} className="flex justify-between py-2 border-b dark:border-gray-700">
                <div className="dark:text-white">
                  {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div className="flex space-x-4">
                  <div className="text-blue-600 dark:text-blue-400">{day.completedSessions} sessions</div>
                  <div className="text-green-600 dark:text-green-400">{formatTime(day.totalFocusTime)}</div>
                  <div className="text-red-600 dark:text-red-400">{formatTime(day.totalPauseTime)} paused</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsDisplay;
