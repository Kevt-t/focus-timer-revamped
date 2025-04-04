import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

interface FocusChartProps {
  dateRange: {
    start: Date;
    end: Date;
  };
}

interface ChartData {
  date: string;
  focusTime: number;
  sessions: number;
}

const FocusChart: React.FC<FocusChartProps> = ({ dateRange }) => {
  const { stats } = useData();
  
  // Prepare data for the chart
  const chartData = useMemo(() => {
    // Filter daily stats within the date range
    const filteredStats = stats.dailyStats.filter(day => {
      const dayDate = new Date(day.date);
      return dayDate >= dateRange.start && dayDate <= dateRange.end;
    });
    
    // Sort by date (oldest first)
    const sortedStats = [...filteredStats].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Convert to chart data format
    return sortedStats.map(day => ({
      date: formatDate(day.date),
      focusTime: Math.round(day.totalFocusTime / 60), // Convert seconds to minutes
      sessions: day.completedSessions
    }));
  }, [stats.dailyStats, dateRange]);
  
  // If no data, show a message
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">No data available for the selected date range.</p>
      </div>
    );
  }
  
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorFocusTime" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-700" />
          <XAxis 
            dataKey="date" 
            className="dark:text-gray-400"
            tick={{ fontSize: 12 }}
            tickMargin={10}
          />
          <YAxis 
            yAxisId="left"
            className="dark:text-gray-400"
            tick={{ fontSize: 12 }}
            tickMargin={10}
            label={{ 
              value: 'Focus Time (min)', 
              angle: -90, 
              position: 'insideLeft',
              className: "dark:fill-gray-400"
            }}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            className="dark:text-gray-400"
            tick={{ fontSize: 12 }}
            tickMargin={10}
            label={{ 
              value: 'Sessions', 
              angle: 90, 
              position: 'insideRight',
              className: "dark:fill-gray-400"
            }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '0.375rem',
              border: 'none',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              color: '#1F2937'
            }}
            formatter={(value, name) => {
              if (name === 'focusTime') return [`${value} min`, 'Focus Time'];
              if (name === 'sessions') return [value, 'Sessions'];
              return [value, name];
            }}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend 
            verticalAlign="top" 
            height={36}
            formatter={(value) => {
              if (value === 'focusTime') return 'Focus Time';
              if (value === 'sessions') return 'Sessions';
              return value;
            }}
          />
          <Area 
            type="monotone" 
            dataKey="focusTime" 
            stroke="#3B82F6" 
            fillOpacity={1} 
            fill="url(#colorFocusTime)" 
            yAxisId="left"
          />
          <Area 
            type="monotone" 
            dataKey="sessions" 
            stroke="#10B981" 
            fillOpacity={1} 
            fill="url(#colorSessions)" 
            yAxisId="right"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString([], { 
    month: 'short', 
    day: 'numeric' 
  });
};

export default FocusChart;
