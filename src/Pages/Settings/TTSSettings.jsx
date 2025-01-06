import React, { useEffect, useState } from 'react';
import {
  setUserTTSPreferences,
  getAvailableVoices
} from "../../utility/Speech.jsx";

export default function TTSSettings() {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(
    localStorage.getItem('ttsVoice') || ''
  );
  const [pitch, setPitch] = useState(
    parseFloat(localStorage.getItem('ttsPitch')) || 1.0
  );
  const [rate, setRate] = useState(
    parseFloat(localStorage.getItem('ttsRate')) || 1.0
  );
  const [volume, setVolume] = useState(
    parseFloat(localStorage.getItem('ttsVolume')) || 1.0
  );
  const [ttsEnabled, setTtsEnabled] = useState(
    localStorage.getItem('ttsEnabled') === 'true' || false
  );

  useEffect(() => {

    const handleVoicesChanged = () => {
      setVoices(getAvailableVoices());
    };

    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);

    // Load any voices that are already available immediately
    setVoices(getAvailableVoices());

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
    };
  }, []);

  // Update user preferences whenever a setting changes
  useEffect(() => {
    setUserTTSPreferences({
      voiceName: selectedVoice,
      pitch: pitch,
      rate: rate,
      volume: volume,
      enabled: ttsEnabled,
    });
  }, [selectedVoice, pitch, rate, volume, ttsEnabled]);

  return (
    <div className="card mb-6 p-4 border border-gray-200 rounded-md shadow-sm">
      <div className="card-body">
        <h2 className="card-title text-xl font-semibold mb-2">Text-to-Speech</h2>

        {/* Enable TTS */}
        <div className="form-group mb-4">
          <label className="form-label" htmlFor="ttsEnabledCheckbox">
            Enable Text-to-Speech
          </label>
          <input
            id="ttsEnabledCheckbox"
            type="checkbox"
            checked={ttsEnabled}
            onChange={(e) => setTtsEnabled(e.target.checked)}
            className="form-check-input"
          />
        </div>

        {ttsEnabled && (
          <>
            {/* Voice Selection */}
            <div className="form-group mb-4">
              <label className="form-label" htmlFor="ttsVoiceSelect">
                Voice
              </label>
              <select
                id="ttsVoiceSelect"
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="form-select"
              >
                <option value="">System Default</option>
                {voices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>

            {/* Pitch */}
            <div className="form-group mb-4">
              <label className="form-label" htmlFor="pitchRange">
                Pitch: {pitch.toFixed(1)}
              </label>
              <input
                id="pitchRange"
                type="range"
                min="0"
                max="2"
                step="0.01"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="form-range"
              />
            </div>

            {/* Rate */}
            <div className="form-group mb-4">
              <label className="form-label" htmlFor="rateRange">
                Rate: {rate.toFixed(1)}
              </label>
              <input
                id="rateRange"
                type="range"
                min="0.5"
                max="2"
                step="0.01"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                className="form-range"
              />
            </div>

            {/* Volume */}
            <div className="form-group mb-4">
              <label className="form-label" htmlFor="volumeRange">
                Volume: {volume.toFixed(1)}
              </label>
              <input
                id="volumeRange"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="form-range"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
