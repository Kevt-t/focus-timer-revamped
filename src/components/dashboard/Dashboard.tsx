import React from 'react';
import ProgressOverview from './ProgressOverview';
import RecentMilestones from './RecentMilestones';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard p-4">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Focus Timer Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProgressOverview />
        <RecentMilestones />
      </div>
    </div>
  );
};

export default Dashboard;
