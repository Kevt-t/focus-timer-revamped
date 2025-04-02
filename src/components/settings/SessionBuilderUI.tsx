import React, { useState } from 'react';

interface SessionSegment {
  label: string;
  focus: number;
  break: number;
}

const SessionBuilderUI: React.FC = () => {
  const [segments, setSegments] = useState<SessionSegment[]>([]);
  const [label, setLabel] = useState<string>('Focus Session');
  const [focusDuration, setFocusDuration] = useState<number>(25);
  const [breakDuration, setBreakDuration] = useState<number>(5);
  const [presets, setPresets] = useState<SessionSegment[][]>([]);

  const addSegment = () => {
    setSegments([...segments, { label, focus: focusDuration, break: breakDuration }]);
    setLabel('');
    setFocusDuration(25);
    setBreakDuration(5);
  };

  const savePreset = () => {
    setPresets([...presets, segments]);
    setSegments([]);
  };

  const loadPreset = (preset: SessionSegment[]) => {
    setSegments(preset);
  };

  const exportPresets = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(presets));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "presets.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="session-builder-ui p-4">
      <h2 className="text-2xl font-bold mb-4">Session Builder</h2>
      <div className="mb-4">
        <label className="block mb-2">Label:</label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="border rounded p-2 w-full"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Focus Duration (minutes):</label>
        <input
          type="number"
          value={focusDuration}
          onChange={(e) => setFocusDuration(Number(e.target.value))}
          className="border rounded p-2 w-full"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Break Duration (minutes):</label>
        <input
          type="number"
          value={breakDuration}
          onChange={(e) => setBreakDuration(Number(e.target.value))}
          className="border rounded p-2 w-full"
        />
      </div>
      <button onClick={addSegment} className="bg-blue-500 text-white py-2 px-4 rounded">
        Add Segment
      </button>
      <button onClick={savePreset} className="bg-green-500 text-white py-2 px-4 rounded ml-2">
        Save Preset
      </button>
      <button onClick={exportPresets} className="bg-gray-500 text-white py-2 px-4 rounded ml-2">
        Export Presets
      </button>
      <div className="mt-4">
        <h3 className="text-xl font-bold mb-2">Segments</h3>
        <ul>
          {segments.map((segment, index) => (
            <li key={index} className="mb-2">
              {segment.label}: Focus {segment.focus} min, Break {segment.break} min
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4">
        <h3 className="text-xl font-bold mb-2">Presets</h3>
        <ul>
          {presets.map((preset, index) => (
            <li key={index} className="mb-2">
              <button onClick={() => loadPreset(preset)} className="bg-blue-500 text-white py-1 px-2 rounded">
                Load Preset {index + 1}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SessionBuilderUI;
