import React, { useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useData } from '../../context/DataContext';
import StorageHelper from './StorageHelper';

// DataManager component handles synchronization between contexts and localStorage
// It doesn't render any UI elements but ensures data persistence
const DataManager: React.FC = () => {
  const { settings } = useSettings();
  const { stats, currentSession } = useData();

  // Sync settings to localStorage whenever they change
  useEffect(() => {
    StorageHelper.saveSettings(settings);
  }, [settings]);

  // Sync stats to localStorage whenever they change
  useEffect(() => {
    StorageHelper.saveStats(stats);
  }, [stats]);

  // Sync current session to localStorage whenever it changes
  useEffect(() => {
    StorageHelper.saveCurrentSession(currentSession);
  }, [currentSession]);

  // This component doesn't render anything visible
  return null;
};

export default DataManager;
