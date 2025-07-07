import React, { useEffect, useState } from 'react';
import { useData } from '../../context/DataContext';

interface StatsSummaryProps {
  dateRange: {
    start: Date;
    end: Date;
  };
}

const StatsSummary: React.FC<StatsSummaryProps> = ({ dateRange }) => {
  const { stats } = useData();
  const [summary, setSummary] = useState({
    totalSessions: 0,
    totalFocusTime: 0,
    avgDailySessions: 0,
    avgSessionLength: 0,
    productivityScore: 0
  });
  
  // Filter stats whenever dateRange or dailyStats changes
  useEffect(() => {
    // Filter daily stats within the date range
    const filtered = stats.dailyStats.filter(day => {
      const dayDate = new Date(day.date);
      return dayDate >= dateRange.start && dayDate <= dateRange.end;
    });
    
    console.log(`StatsSummary: Filtered ${filtered.length} days from ${stats.dailyStats.length} total days`);
    console.log(`StatsSummary: Date range ${dateRange.start.toISOString()} - ${dateRange.end.toISOString()}`);
    
    // Debug information for each day
    if (stats.dailyStats.length > 0 && filtered.length === 0) {
      stats.dailyStats.forEach(day => {
        const dayDate = new Date(day.date);
        console.log(`Day: ${day.date}, isInRange: ${dayDate >= dateRange.start && dayDate <= dateRange.end}`);
        console.log(`Day timestamp: ${dayDate.getTime()}, Range: ${dateRange.start.getTime()} - ${dateRange.end.getTime()}`);
      });
    }
    
    // Calculate summary statistics based on filtered data
    const totalSessions = filtered.reduce(
      (total, day) => total + day.completedSessions, 
      0
    );
    
    const totalFocusTime = filtered.reduce(
      (total, day) => total + day.totalFocusTime, 
      0
    );
    
    const dayCount = Math.max(1, filtered.length);
    const avgDailySessions = totalSessions / dayCount;
    
    const avgSessionLength = totalSessions > 0 
      ? totalFocusTime / totalSessions 
      : 0;
    
    const targetDailySessions = 3; // Target: 3 sessions per day
    const targetSessionLength = 25 * 60; // Target: 25 minutes per session
    
    const sessionsScore = Math.min(100, (avgDailySessions / targetDailySessions) * 100);
    const lengthScore = Math.min(100, (avgSessionLength / targetSessionLength) * 100);
    
    const productivityScore = Math.round((sessionsScore + lengthScore) / 2);
    
    setSummary({
      totalSessions,
      totalFocusTime,
      avgDailySessions,
      avgSessionLength,
      productivityScore
    });
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
