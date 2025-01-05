import React, { useEffect, useState } from 'react';
import {
  setUserAudioPreferences,
} from "../../utility/Audio.jsx";

export default function AudioSettings() {
  // State variables for audio settings
  const [masterVolume, setMasterVolume] = useState(
    parseFloat(localStorage.getItem('masterVolume')) || 1.0
  );
  const [soundEffectVolume, setSoundEffectVolume] = useState(
    parseFloat(localStorage.getItem('soundEffectVolume')) || 1.0
  );
  const [voiceDialogueVolume, setVoiceDialogueVolume] = useState(
    parseFloat(localStorage.getItem('voiceDialogueVolume')) || 1.0
  );
  const [musicVolume, setMusicVolume] = useState(
    parseFloat(localStorage.getItem('musicVolume')) || 1.0
  );

  // Update user preferences whenever a setting changes
  useEffect(() => {
    setUserAudioPreferences({
      masterVolume: masterVolume,
      soundEffectVolume: soundEffectVolume,
      voiceDialogueVolume: voiceDialogueVolume,
      musicVolume: musicVolume,
    });
  }, [masterVolume, soundEffectVolume, voiceDialogueVolume, musicVolume]);

  return (
    <div className="card mb-6 p-4 border border-gray-200 rounded-md shadow-sm">
      <div className="card-body">
        <h2 className="card-title text-xl font-semibold mb-4">General Audio</h2>

        {/* Master Volume */}
        <div className="form-group mb-4">
          <label className="form-label" htmlFor="masterVolumeRange">
            Master Volume: {(masterVolume * 100).toFixed(0)}%
          </label>
          <input
            id="masterVolumeRange"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={masterVolume}
            onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
            className="form-range"
          />
        </div>

        {/* Sound Effects */}
        <div className="form-group mb-4">
          <label className="form-label" htmlFor="soundEffectVolumeRange">
            Sound Effect Volume: {(soundEffectVolume * 100).toFixed(0)}%
          </label>
          <input
            id="soundEffectVolumeRange"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={soundEffectVolume}
            onChange={(e) => setSoundEffectVolume(parseFloat(e.target.value))}
            className="form-range"
          />
        </div>

        {/* Voice Dialogue */}
        <div className="form-group mb-4">
          <label className="form-label" htmlFor="voiceDialogueVolumeRange">
            Dialogue Volume: {(voiceDialogueVolume * 100).toFixed(0)}%
          </label>
          <input
            id="voiceDialogueVolumeRange"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={voiceDialogueVolume}
            onChange={(e) => setVoiceDialogueVolume(parseFloat(e.target.value))}
            className="form-range"
          />
        </div>

        {/* Music Settings */}
        <div className="form-group mb-4">
          <label className="form-label" htmlFor="musicVolumeRange">
            Music Volume: {(musicVolume * 100).toFixed(0)}%  
          </label>
          <input
            id="musicVolumeRange"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={musicVolume}
            onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
            className="form-range"
          />
        </div>
      </div>
    </div>
  );
}
