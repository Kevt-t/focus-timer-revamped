import React from 'react';
import { useSettings, ThemeType } from '../../context/SettingsContext';
import Button from '../common/Button';

const ThemeSelector: React.FC = () => {
  const { settings, toggleTheme } = useSettings();

  const themeLabels: Record<ThemeType, string> = {
    light: 'Light',
    dark: 'Dark',
    system: 'System'
  };

  const themeIcons: Record<ThemeType, React.ReactNode> = {
    light: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
      </svg>
    ),
    dark: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
      </svg>
    ),
    system: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
      </svg>
    )
  };

  return (
    <div className="theme-selector">
      <h3 className="text-lg font-medium mb-2 dark:text-white">Theme</h3>
      <div className="flex items-center space-x-2">
        <div className="flex-1 p-3 border rounded-md dark:border-gray-700 dark:text-white">
          <div className="flex items-center">
            {themeIcons[settings.theme]}
            <span className="ml-2">{themeLabels[settings.theme]}</span>
          </div>
        </div>
        <Button 
          variant="primary" 
          onClick={toggleTheme}
          size="sm"
        >
          Change
        </Button>
      </div>
    </div>
  );
};

export default ThemeSelector;
