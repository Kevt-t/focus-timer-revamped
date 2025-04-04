import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';

interface StatsSummaryProps {
  dateRange: {
    start: Date;
    end: Date;
  };
}

const StatsSummary: React.FC<StatsSummaryProps> = ({ dateRange }) => {
  const { stats } = useData();
  
  // Calculate summary statistics for the selected date range
  const summary = useMemo(() => {
    // Filter daily stats within the date range
    const filteredStats = stats.dailyStats.filter(day => {
      const dayDate = new Date(day.date);
      return dayDate >= dateRange.start && dayDate <= dateRange.end;
    });
    
    // Calculate total sessions in the date range
    const totalSessions = filteredStats.reduce(
      (total, day) => total + day.completedSessions, 
      0
    );
    
    // Calculate total focus time in the date range (in seconds)
    const totalFocusTime = filteredStats.reduce(
      (total, day) => total + day.totalFocusTime, 
      0
    );
    
    // Calculate average daily sessions
    const dayCount = Math.max(1, filteredStats.length);
    const avgDailySessions = totalSessions / dayCount;
    
    // Calculate average session length
    const avgSessionLength = totalSessions > 0 
      ? totalFocusTime / totalSessions 
      : 0;
    
    // Calculate productivity score (0-100)
    // Based on sessions completed and focus time relative to targets
    const targetDailySessions = 3; // Target: 3 sessions per day
    const targetSessionLength = 25 * 60; // Target: 25 minutes per session
    
    const sessionsScore = Math.min(100, (avgDailySessions / targetDailySessions) * 100);
    const lengthScore = Math.min(100, (avgSessionLength / targetSessionLength) * 100);
    
    const productivityScore = Math.round((sessionsScore + lengthScore) / 2);
    
    return {
      totalSessions,
      totalFocusTime,
      avgDailySessions,
      avgSessionLength,
      productivityScore
    };
  }, [stats.dailyStats, dateRange]);
  
  return (
    <div className="stats-summary grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Sessions</h3>
        <p className="text-2xl font-bold dark:text-white">{summary.totalSessions}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Focus Time</h3>
        <p className="text-2xl font-bold dark:text-white">{formatTime(summary.totalFocusTime)}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {Math.round(summary.totalFocusTime / 60)} minutes
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Avg. Daily Sessions</h3>
        <p className="text-2xl font-bold dark:text-white">{summary.avgDailySessions.toFixed(1)}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          sessions per day
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Avg. Session Length</h3>
        <p className="text-2xl font-bold dark:text-white">{formatTime(summary.avgSessionLength)}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          per focus session
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Productivity Score</h3>
        <p className="text-2xl font-bold dark:text-white">{summary.productivityScore}</p>
        <div className="mt-1">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${summary.productivityScore}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to format time in HH:MM:SS
const formatTime = (seconds: number): string => {
  if (isNaN(seconds)) return '0m';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
};

export default StatsSummary;
