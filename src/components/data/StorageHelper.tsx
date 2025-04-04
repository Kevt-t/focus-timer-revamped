import { TimerSettings } from '../../context/SettingsContext';
import { UserStats, SessionData } from '../../context/DataContext';

// Keys for localStorage
const STORAGE_KEYS = {
  SETTINGS: 'timerSettings',
  STATS: 'timerStats',
  CURRENT_SESSION: 'currentSession'
};

// Storage helper functions
export const StorageHelper = {
  // Settings storage
  getSettings: (): TimerSettings | null => {
    try {
      const settingsJson = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return settingsJson ? JSON.parse(settingsJson) : null;
    } catch (error) {
      console.error('Error retrieving settings from localStorage:', error);
      return null;
    }
  },

  saveSettings: (settings: TimerSettings): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
    }
  },

  // Stats storage
  getStats: (): UserStats | null => {
    try {
      const statsJson = localStorage.getItem(STORAGE_KEYS.STATS);
      return statsJson ? JSON.parse(statsJson) : null;
    } catch (error) {
      console.error('Error retrieving stats from localStorage:', error);
      return null;
    }
  },

  saveStats: (stats: UserStats): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    } catch (error) {
      console.error('Error saving stats to localStorage:', error);
    }
  },

  // Current session storage
  getCurrentSession: (): SessionData | null => {
    try {
      const sessionJson = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
      return sessionJson ? JSON.parse(sessionJson) : null;
    } catch (error) {
      console.error('Error retrieving current session from localStorage:', error);
      return null;
    }
  },

  saveCurrentSession: (session: SessionData | null): void => {
    try {
      if (session) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
      }
    } catch (error) {
      console.error('Error saving current session to localStorage:', error);
    }
  },

  // Clear all data
  clearAllData: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.STATS);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    } catch (error) {
      console.error('Error clearing data from localStorage:', error);
    }
  }
};

export default StorageHelper;
