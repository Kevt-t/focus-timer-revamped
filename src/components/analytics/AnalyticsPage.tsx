import React from 'react';
import AnalyticsDashboard from './AnalyticsDashboard';

const AnalyticsPage: React.FC = () => {
  return (
    <div className="analytics-page p-4">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Analytics</h1>
      <AnalyticsDashboard />
    </div>
  );
};

export default AnalyticsPage;
