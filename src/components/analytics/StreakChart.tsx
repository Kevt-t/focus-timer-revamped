import React from 'react';
import { useData } from '../../context/DataContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

const StreakChart: React.FC = () => {
  const { stats } = useData();
  
  // Create data for the streak chart
  const streakData = [
    { name: 'Current Streak', value: stats.currentStreak },
    { name: 'Longest Streak', value: stats.longestStreak }
  ];
  
  // Calculate streak achievement progress
  const streakAchievement = stats.achievements.find(a => a.id === 'streakChampion');
  const streakGoals = streakAchievement ? streakAchievement.tiers.map(tier => ({
    name: `Level ${tier.level}`,
    value: tier.requirement,
    unlocked: tier.unlocked
  })) : [];
  
  // Combine streak data with achievement goals
  const chartData = [...streakData, ...streakGoals];
  
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-700" />
          <XAxis 
            dataKey="name" 
            className="dark:text-gray-400"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            className="dark:text-gray-400"
            tick={{ fontSize: 12 }}
            label={{ 
              value: 'Days', 
              angle: -90, 
              position: 'insideLeft',
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
            formatter={(value) => [`${value} days`, 'Streak']}
          />
          <Bar dataKey="value">
            {chartData.map((entry, index) => {
              let color = '#3B82F6'; // Default blue
              
              if (entry.name === 'Current Streak') {
                color = '#10B981'; // Green
              } else if (entry.name === 'Longest Streak') {
                color = '#6366F1'; // Indigo
              } else if (entry.unlocked) {
                color = '#10B981'; // Green for unlocked achievements
              } else {
                color = '#9CA3AF'; // Gray for locked achievements
              }
              
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StreakChart;
