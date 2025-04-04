import React from 'react';
import { useData, SessionData } from '../../context/DataContext';

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
  
  // Get today's individual sessions
  const todaySessions = stats.sessionHistory.filter(session => {
    const sessionDate = new Date(session.startTime).toISOString().split('T')[0];
    return sessionDate === today;
  }).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()); // Sort by most recent first
  
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
      
      <div className="recent-activity mt-4">
        <h3 className="text-lg font-medium mb-2 dark:text-white">Today's Sessions</h3>
        <div className="max-h-60 overflow-y-auto">
          {todaySessions.length > 0 ? (
            todaySessions.map(session => (
              <div key={session.id} className="p-3 mb-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <span className={`mr-2 text-lg ${getSessionTypeIcon(session.type).color}`}>
                      {getSessionTypeIcon(session.type).icon}
                    </span>
                    <span className="font-medium dark:text-white">
                      {getSessionTypeLabel(session.type)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatTimeOfDay(session.startTime)}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Duration</div>
                    <div className="font-medium dark:text-white">{formatTime(session.duration)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Focus Time</div>
                    <div className="font-medium text-green-600 dark:text-green-400">
                      {session.completed ? formatTime(session.duration - Math.floor(session.totalPausedTime / 1000)) : formatTime(0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Pause Time</div>
                    <div className="font-medium text-red-600 dark:text-red-400">
                      {formatTime(Math.floor(session.totalPausedTime / 1000))}
                    </div>
                  </div>
                </div>
                
                {/* Progress bar showing focus vs pause ratio */}
                <div className="mt-2">
                  <div className="relative h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-green-500 dark:bg-green-600"
                      style={{
                        width: session.completed ? 
                          `${((session.duration - Math.floor(session.totalPausedTime / 1000)) / session.duration) * 100}%` : 
                          '0%'
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                  <div>
                    {session.completed ? 
                      <span className="text-green-500 dark:text-green-400">✓ Completed</span> : 
                      <span className="text-red-500 dark:text-red-400">✗ Cancelled</span>
                    }
                  </div>
                  <div>
                    Efficiency: {session.completed ? `${calculateEfficiency(session)}%` : 'N/A'}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <p>No sessions completed today.</p>
              <p className="mt-2 text-sm">Start a focus session to track your progress!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper functions for session display
const getSessionTypeIcon = (type: string): { icon: string; color: string } => {
  switch (type) {
    case 'pomodoro':
      return { icon: '🍅', color: 'text-red-500' };
    case 'shortBreak':
      return { icon: '☕', color: 'text-blue-500' };
    case 'longBreak':
      return { icon: '🌴', color: 'text-green-500' };
    case 'custom':
      return { icon: '⚙️', color: 'text-purple-500' };
    default:
      return { icon: '⏱️', color: 'text-gray-500' };
  }
};

const getSessionTypeLabel = (type: string): string => {
  switch (type) {
    case 'pomodoro':
      return 'Focus Session';
    case 'shortBreak':
      return 'Short Break';
    case 'longBreak':
      return 'Long Break';
    case 'custom':
      return 'Custom Session';
    default:
      return 'Session';
  }
};

const formatTimeOfDay = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const calculateEfficiency = (session: SessionData): number => {
  const totalSessionTime = session.duration;
  const pauseTime = Math.floor(session.totalPausedTime / 1000);
  const focusTime = totalSessionTime - pauseTime;
  
  return Math.round((focusTime / totalSessionTime) * 100);
};

export default StatsDisplay;
