import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [sections, setSections] = useState([]);
  const [sectionName, setSectionName] = useState('');
  const [duration, setDuration] = useState('');
  const [color, setColor] = useState('#000000');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [meetingStarted, setMeetingStarted] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const [presets, setPresets] = useState(() => {
    const saved = localStorage.getItem('meetingPresets');
    return saved ? JSON.parse(saved) : [];
  });
  const [presetName, setPresetName] = useState('');

  const currentSection = sections[currentSectionIndex];

  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setHighlight(true);
      setTimeout(() => setHighlight(false), 1000);

      if (currentSectionIndex < sections.length - 1) {
        const nextIndex = currentSectionIndex + 1;
        setCurrentSectionIndex(nextIndex);
        setTimeLeft(sections[nextIndex].duration);
      } else {
        setIsRunning(false);
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, currentSectionIndex, sections]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const addSection = () => {
    if (sectionName && duration && !isNaN(duration)) {
      const newSection = {
        name: sectionName,
        duration: parseInt(duration) * 60,
        color: color || '#000000'
      };
      setSections([...sections, newSection]);
      setSectionName('');
      setDuration('');
      setColor('#000000');
    }
  };

  const startMeeting = () => {
    if (sections.length > 0) {
      setMeetingStarted(true);
      setCurrentSectionIndex(0);
      setTimeLeft(sections[0].duration);
      setIsRunning(true);
    }
  };

  const resetMeeting = () => {
    setMeetingStarted(false);
    setSections([]);
    setSectionName('');
    setDuration('');
    setColor('#000000');
    setCurrentSectionIndex(0);
    setTimeLeft(0);
    setIsRunning(false);
  };

  const savePreset = () => {
    if (presetName && sections.length > 0) {
      const updatedPresets = [...presets, { name: presetName, sections }];
      setPresets(updatedPresets);
      localStorage.setItem('meetingPresets', JSON.stringify(updatedPresets));
      setPresetName('');
    }
  };

  const loadPreset = (preset) => {
    setSections(preset.sections);
    setMeetingStarted(false);
    setCurrentSectionIndex(0);
    setTimeLeft(0);
    setIsRunning(false);
  };

  return (
    <div
      className="App"
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: highlight ? '#ffcccc' : '#f8f8f8',
        padding: '30px',
        borderRadius: '10px',
        maxWidth: '700px',
        margin: '40px auto'
      }}
    >
      <div style={{ flex: 1, paddingRight: '30px' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>⏱ Meeting Timer</h1>

        {!meetingStarted ? (
          <div>
            <h2>Add Meeting Sections</h2>
            <input
              type="text"
              placeholder="Section Name"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              style={{ marginRight: '10px' }}
            />
            <input
              type="number"
              placeholder="Duration (minutes)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              style={{ width: '100px', marginRight: '10px' }}
            />
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{ width: '40px', height: '40px', marginRight: '10px' }}
              title="Choose section color"
            />
            <button onClick={addSection}>Add</button>

            <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px' }}>
              {sections.map((section, index) => (
                <li key={index}>
                  <span style={{ color: section.color }}>■</span> {section.name} – {section.duration / 60} min
                </li>
              ))}
            </ul>

            <div style={{ marginTop: '20px' }}>
              <input
                type="text"
                placeholder="Preset Name"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                style={{ marginRight: '10px' }}
              />
              <button onClick={savePreset}>Save Preset</button>
            </div>

            {presets.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h3>Load Preset</h3>
                {presets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => loadPreset(preset)}
                    style={{ marginRight: '10px', marginBottom: '5px' }}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={startMeeting}
              disabled={sections.length === 0}
              style={{ marginTop: '20px', padding: '10px 20px' }}
            >
              Start Meeting
            </button>
          </div>
        ) : (
          <div>
            <h2>
              Current Section: <span style={{ color: currentSection?.color }}>■</span> {currentSection?.name}
            </h2>
            <h1 style={{ fontSize: '4rem', fontWeight: 'bold', margin: '20px 0' }}>
              {formatTime(timeLeft)}
            </h1>
            <button onClick={() => setIsRunning(!isRunning)}>
              {isRunning ? 'Pause' : 'Resume'}
            </button>
            <button onClick={resetMeeting} style={{ marginLeft: '10px' }}>
              Reset
            </button>
          </div>
        )}
      </div>

      {meetingStarted && (
        <div style={{ width: '180px', paddingLeft: '20px', fontSize: '0.9rem', borderLeft: '1px solid #ccc' }}>
          <h3>Agenda</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {sections.map((section, index) => (
              <li
                key={index}
                style={{
                  fontWeight: index === currentSectionIndex ? 'bold' : 'normal',
                  color: section.color
                }}
              >
                ■ {section.name} ({section.duration / 60} min)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
