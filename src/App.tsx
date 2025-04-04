
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TimerDisplay from './components/timer/TimerDisplay';
import SettingsPanel from './components/settings/SettingsPanel';
import { SettingsProvider } from './context/SettingsContext';
import { DataProvider } from './context/DataContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import DataManager from './components/data/DataManager';
import Navigation from './components/common/Navigation';
import Dashboard from './components/dashboard/Dashboard';
import AchievementsPage from './components/achievements/AchievementsPage';
import AnalyticsPage from './components/analytics/AnalyticsPage';
import './index.css';
import './App.css';
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <DataProvider>
          <Router>
            <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
              <Navigation />
              <main className="flex-grow container mx-auto py-6">
                <Routes>
                  <Route path="/" element={
                    <div className="flex items-center justify-center min-h-[80vh]">
                      <TimerDisplay />
                    </div>
                  } />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/achievements" element={<AchievementsPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                </Routes>
              </main>
              {/* Settings panel is available on all pages */}
              <SettingsPanel />
              <DataManager />
              <ToastContainer position="bottom-right" autoClose={3000} />
            </div>
          </Router>
        </DataProvider>
      </SettingsProvider>
    </ErrorBoundary>
  );
}

export default App;