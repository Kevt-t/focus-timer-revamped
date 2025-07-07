import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import FocusChart from './FocusChart';
import StreakChart from './StreakChart';
import StatsSummary from './StatsSummary';

type TimeRange = 'week' | 'month' | 'quarter' | 'all';

const AnalyticsDashboard: React.FC = () => {
  const { stats } = useData();
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({ start: new Date(), end: new Date() });
  
  // Calculate date range whenever timeRange or stats change
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    
    switch (timeRange) {
      case 'week':
        start.setDate(end.getDate() - 7); // Last 7 days
        break;
      case 'month':
        start.setDate(end.getDate() - 30); // Last 30 days
        break;
      case 'quarter':
        start.setDate(end.getDate() - 90); // Last 90 days
        break;
      case 'all':
        // Find the earliest date between session history and daily stats
        if (stats.sessionHistory.length > 0 || stats.dailyStats.length > 0) {
          const sessionDates = stats.sessionHistory.map(s => new Date(s.startTime));
          const statsDates = stats.dailyStats.map(d => new Date(d.date));
          const allDates = [...sessionDates, ...statsDates];
          
          if (allDates.length > 0) {
            const earliestDate = new Date(Math.min(...allDates.map(d => d.getTime())));
            start.setTime(earliestDate.getTime());
          } else {
            start.setDate(end.getDate() - 30); // Default to 30 days if no history
          }
        } else {
          start.setDate(end.getDate() - 30); // Default to 30 days if no history
        }
        break;
    }
    
    // For debugging
    console.log(`Date range: ${start.toISOString()} - ${end.toISOString()}`);
    console.log(`Daily stats available: ${stats.dailyStats.length} days`);
    
    setDateRange({ start, end });
  }, [timeRange, stats.sessionHistory, stats.dailyStats]);
  
  return (
    <div className="analytics-dashboard">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold dark:text-white">Analytics Dashboard</h2>
        <div className="flex space-x-2">
          <button 
            className={`px-3 py-1 text-sm rounded-full ${
              timeRange === 'week' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setTimeRange('week')}
          >
            Last Week
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-full ${
              timeRange === 'month' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setTimeRange('month')}
          >
            Last Month
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-full ${
              timeRange === 'quarter' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setTimeRange('quarter')}
          >
            Last 90 Days
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-full ${
              timeRange === 'all' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setTimeRange('all')}
          >
            All Time
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <StatsSummary dateRange={dateRange} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Focus Time Trends</h3>
          <FocusChart dateRange={dateRange} />
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Streak Performance</h3>
          <StreakChart />
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold dark:text-white">Productivity Patterns</h3>
          <button 
            className="text-blue-500 hover:text-blue-600 text-sm"
            onClick={() => {
              // Get the filtered data based on current date range
              const filteredData = stats.dailyStats.filter(day => {
                const dayDate = new Date(day.date);
                return dayDate >= dateRange.start && dayDate <= dateRange.end;
              });
              
              // Export filtered data as CSV
              const csvData = filteredData.map(day => 
                `${day.date},${day.completedSessions},${day.totalFocusTime},${day.totalPauseTime}`
              ).join('\n');
              
              // Build CSV header
              const header = 'Date,Completed Sessions,Total Focus Time (s),Total Pause Time (s)\n';
              const csv = header + csvData;
              
              // Create and download CSV file
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              
              // Add date range to filename
              const startStr = dateRange.start.toISOString().split('T')[0];
              const endStr = dateRange.end.toISOString().split('T')[0];
              a.download = `focus-timer-data-${startStr}-to-${endStr}.csv`;
              
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
          >
            Export Data
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sessions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Focus Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Efficiency</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {stats.dailyStats
                .filter(day => {
                  const dayDate = new Date(day.date);
                  return dayDate >= dateRange.start && dayDate <= dateRange.end;
                })
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(day => {
                  // Calculate efficiency (focus time / (focus time + pause time))
                  const totalTime = day.totalFocusTime + day.totalPauseTime;
                  const efficiency = totalTime > 0 
                    ? Math.round((day.totalFocusTime / totalTime) * 100) 
                    : 0;
                  
                  return (
                    <tr key={day.date}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(day.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {day.completedSessions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatTime(day.totalFocusTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${efficiency}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white">{efficiency}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Helper function to format time in HH:MM:SS
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
};

export default AnalyticsDashboard;
