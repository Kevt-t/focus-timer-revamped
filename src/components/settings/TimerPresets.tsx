import React, { useState } from 'react';
import { useSettings, TimerPresetType } from '../../context/SettingsContext';
import Button from '../common/Button';

const TimerPresets: React.FC = () => {
  const { settings, updateTimerPreset, setActivePreset } = useSettings();
  const [editingPreset, setEditingPreset] = useState<TimerPresetType | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  const presetLabels: Record<TimerPresetType, string> = {
    pomodoro: 'Focus Session',
    shortBreak: 'Short Break',
    longBreak: 'Long Break',
    custom: 'Custom Timer'
  };

  const startEditing = (preset: TimerPresetType) => {
    setEditingPreset(preset);
    setEditValue(settings.timerPresets[preset]);
  };

  const savePreset = () => {
    if (editingPreset && editValue >= 1 && editValue <= 120) {
      updateTimerPreset(editingPreset, editValue);
      setEditingPreset(null);
    }
  };

  const cancelEditing = () => {
    setEditingPreset(null);
  };

  return (
    <div className="timer-presets">
      <h3 className="text-lg font-medium mb-2 dark:text-white">Timer Presets</h3>
      
      <div className="space-y-3">
        {Object.entries(settings.timerPresets).map(([preset, duration]) => (
          <div key={preset} className="flex items-center justify-between">
            <div className="flex flex-col dark:text-white">
              <span className="font-medium">{presetLabels[preset as TimerPresetType]}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {duration} {duration === 1 ? 'minute' : 'minutes'}
              </span>
            </div>
            
            <div className="flex space-x-2">
              {editingPreset === preset ? (
                <>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={editValue}
                    onChange={(e) => setEditValue(parseInt(e.target.value) || 1)}
                    className="w-16 px-2 py-1 border rounded"
                  />
                  <Button variant="success" size="sm" onClick={savePreset}>
                    Save
                  </Button>
                  <Button variant="secondary" size="sm" onClick={cancelEditing}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant={settings.activePreset === preset ? 'primary' : 'secondary'} 
                    size="sm"
                    onClick={() => setActivePreset(preset as TimerPresetType)}
                  >
                    {settings.activePreset === preset ? 'Active' : 'Use'}
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => startEditing(preset as TimerPresetType)}>
                    Edit
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimerPresets;
