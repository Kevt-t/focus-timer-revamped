import React from 'react';

const SessionConfigPanel: React.FC = () => {
  return (
    <div className="session-config-panel">
      <h2>Session Configuration</h2>
      {/* Add form elements for session customization here */}
      <form>
        <label>
          Focus Duration (minutes):
          <input type="number" name="focusDuration" min="1" max="60" />
        </label>
        <label>
          Break Duration (minutes):
          <input type="number" name="breakDuration" min="1" max="60" />
        </label>
        <button type="submit">Save Configuration</button>
      </form>
    </div>
  );
};

export default SessionConfigPanel;
