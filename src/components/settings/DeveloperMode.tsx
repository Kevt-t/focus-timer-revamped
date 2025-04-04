import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import Button from '../common/Button';

const DeveloperMode: React.FC = () => {
  const { fastForwardSessions } = useData();
  const [numSessions, setNumSessions] = useState(5);
  const [focusTimePerSession, setFocusTimePerSession] = useState(25 * 60); // 25 minutes in seconds
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFastForward = () => {
    fastForwardSessions(numSessions, focusTimePerSession);
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
      <div 
        className="flex justify-between items-center cursor-pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-medium text-red-600 dark:text-red-400 flex items-center">
          <span className="mr-2">🧪</span> Developer Mode
        </h3>
        <span className="text-gray-500 dark:text-gray-400">
          {isExpanded ? '▼' : '►'}
        </span>
      </div>
      
      {isExpanded && (
        <div className="mt-3 space-y-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
          <div className="text-sm text-red-800 dark:text-red-300 mb-2">
            These tools are for testing purposes only.
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Number of Sessions
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={numSessions}
                onChange={(e) => setNumSessions(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                           shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 
                           dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Focus Time Per Session (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={Math.floor(focusTimePerSession / 60)}
                onChange={(e) => setFocusTimePerSession((parseInt(e.target.value) || 1) * 60)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                           shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 
                           dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <Button
              variant="danger"
              onClick={handleFastForward}
              className="w-full"
            >
              Fast Forward Sessions
            </Button>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              This will simulate completed focus sessions to help test achievements and statistics.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeveloperMode;
