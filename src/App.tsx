
import TimerDisplay from './components/timer/TimerDisplay';
import SettingsPanel from './components/settings/SettingsPanel';
import { SettingsProvider } from './context/SettingsContext';
import { DataProvider } from './context/DataContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import DataManager from './components/data/DataManager';
import './index.css';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <DataProvider>
          <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <TimerDisplay />
            <SettingsPanel />
            <DataManager />
          </div>
        </DataProvider>
      </SettingsProvider>
    </ErrorBoundary>
  );
}

export default App;