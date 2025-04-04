import React from 'react';
import { useSettings } from '../../context/SettingsContext';

const NotificationSettings: React.FC = () => {
  const { settings, toggleSound, toggleNotifications } = useSettings();

  return (
    <div className="notification-settings">
      <h3 className="text-lg font-medium mb-2 dark:text-white">Notifications</h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="sound-toggle" className="flex items-center cursor-pointer dark:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>
            Sound Effects
          </label>
          <div className="relative inline-block w-10 mr-2 align-middle select-none">
            <input
              id="sound-toggle"
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={toggleSound}
              className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
            />
            <label
              htmlFor="sound-toggle"
              className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                settings.soundEnabled ? 'bg-green-500' : 'bg-gray-300'
              }`}
            ></label>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="notification-toggle" className="flex items-center cursor-pointer dark:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
            Browser Notifications
          </label>
          <div className="relative inline-block w-10 mr-2 align-middle select-none">
            <input
              id="notification-toggle"
              type="checkbox"
              checked={settings.notificationsEnabled}
              onChange={toggleNotifications}
              className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
            />
            <label
              htmlFor="notification-toggle"
              className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                settings.notificationsEnabled ? 'bg-green-500' : 'bg-gray-300'
              }`}
            ></label>
          </div>
        </div>
      </div>

      {/* Custom styles for toggle switches are added via CSS classes */}
    </div>
  );
};

export default NotificationSettings;
