import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define theme types
export type ThemeType = 'light' | 'dark' | 'system';

// Define timer preset types
export type TimerPresetType = 'pomodoro' | 'shortBreak' | 'longBreak' | 'custom';

// Define the settings interface
export interface TimerSettings {
  theme: ThemeType;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  timerPresets: {
    pomodoro: number; // in minutes
    shortBreak: number; // in minutes
    longBreak: number; // in minutes
    custom: number; // in minutes
  };
  activePreset: TimerPresetType;
}

// Default settings
const defaultSettings: TimerSettings = {
  theme: 'light',
  soundEnabled: true,
  notificationsEnabled: true,
  timerPresets: {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    custom: 30
  },
  activePreset: 'pomodoro'
};

// Create the context
interface SettingsContextType {
  settings: TimerSettings;
  updateSettings: (newSettings: Partial<TimerSettings>) => void;
  updateTimerPreset: (preset: TimerPresetType, minutes: number) => void;
  setActivePreset: (preset: TimerPresetType) => void;
  toggleTheme: () => void;
  toggleSound: () => void;
  toggleNotifications: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Provider component
interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<TimerSettings>(() => {
    // Load settings from localStorage if available
    const savedSettings = localStorage.getItem('timerSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('timerSettings', JSON.stringify(settings));
  }, [settings]);

  // Apply theme to document
  useEffect(() => {
    const applyTheme = () => {
      let themeToApply = settings.theme;
      
      if (themeToApply === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        themeToApply = prefersDark ? 'dark' : 'light';
      }
      
      if (themeToApply === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (settings.theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.theme]);

  const updateSettings = (newSettings: Partial<TimerSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const updateTimerPreset = (preset: TimerPresetType, minutes: number) => {
    setSettings(prev => ({
      ...prev,
      timerPresets: {
        ...prev.timerPresets,
        [preset]: minutes
      }
    }));
  };

  const setActivePreset = (preset: TimerPresetType) => {
    setSettings(prev => ({
      ...prev,
      activePreset: preset
    }));
  };

  const toggleTheme = () => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : prev.theme === 'dark' ? 'system' : 'light'
    }));
  };

  const toggleSound = () => {
    setSettings(prev => ({
      ...prev,
      soundEnabled: !prev.soundEnabled
    }));
  };

  const toggleNotifications = () => {
    setSettings(prev => ({
      ...prev,
      notificationsEnabled: !prev.notificationsEnabled
    }));
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSettings,
      updateTimerPreset,
      setActivePreset,
      toggleTheme,
      toggleSound,
      toggleNotifications
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook for using the settings context
export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
