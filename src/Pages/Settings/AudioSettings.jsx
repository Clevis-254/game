import React, { useEffect, useState, useCallback } from 'react';
import debounce from 'lodash.debounce'; // Import lodash.debounce
import {
  setUserAudioPreferences,
  getEqualizerSettings,
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

  // State variables for equalizer settings
  const [equalizerSettings, setEqualizerSettings] = useState(getEqualizerSettings());

  // Debounced function to update user preferences
  const debouncedSetUserAudioPreferences = useCallback(
    debounce((preferences) => {
      setUserAudioPreferences(preferences);
    }, 300), // 300ms debounce delay; adjust as needed
    []
  );

  // Update user preferences whenever a setting changes
  useEffect(() => {
    debouncedSetUserAudioPreferences({
      masterVolume: masterVolume,
      soundEffectVolume: soundEffectVolume,
      voiceDialogueVolume: voiceDialogueVolume,
      musicVolume: musicVolume,
      equalizerSettings: equalizerSettings,
    });

    // Cleanup function to cancel debounce on unmount
    return () => {
      debouncedSetUserAudioPreferences.cancel();
    };
  }, [masterVolume, soundEffectVolume, voiceDialogueVolume, musicVolume, equalizerSettings, debouncedSetUserAudioPreferences]);

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

        {/* Equalizer Settings */}
        <h2 className="card-title text-xl font-semibold mb-4">Equalizer Settings</h2>

        {/* Bass */}
        <div className="form-group mb-4">
          <label className="form-label" htmlFor="bassRange">
            Bass (60Hz): {equalizerSettings.bass.toFixed(1)} dB (decibels)
          </label>
          <input
            id="bassRange"
            type="range"
            min="-12"
            max="12"
            step="0.1"
            value={equalizerSettings.bass}
            onChange={(e) => setEqualizerSettings({ ...equalizerSettings, bass: parseFloat(e.target.value) })}
            className="form-range"
          />
        </div>

        {/* Mid */}
        <div className="form-group mb-4">
          <label className="form-label" htmlFor="midRange">
            Mid (1kHz): {equalizerSettings.mid.toFixed(1)} dB (decibels)
          </label>
          <input
            id="midRange"
            type="range"
            min="-12"
            max="12"
            step="0.1"
            value={equalizerSettings.mid}
            onChange={(e) => setEqualizerSettings({ ...equalizerSettings, mid: parseFloat(e.target.value) })}
            className="form-range"
          />
        </div>

        {/* Treble */}
        <div className="form-group mb-4">
          <label className="form-label" htmlFor="trebleRange">
            Treble (10kHz): {equalizerSettings.treble.toFixed(1)} dB (decibels)
          </label>
          <input
            id="trebleRange"
            type="range"
            min="-12"
            max="12"
            step="0.1"
            value={equalizerSettings.treble}
            onChange={(e) => setEqualizerSettings({ ...equalizerSettings, treble: parseFloat(e.target.value) })}
            className="form-range"
          />
        </div>
      </div>
    </div>
  );
}
