import React from 'react';

// Spaek text function using the Web Speech API
export function speakText(text) {
    if (!window.speechSynthesis) {
      console.warn('SpeechSynthesis not supported by this browser.');
      return;
    }

    // Check if TTS is enabled
    const ttsEnabled = localStorage.getItem('ttsEnabled') === 'true';
    if (!ttsEnabled) {
      console.warn('TTS is disabled.');
      return;
    }

    // Cancel any ongoing speech before starting a new one
    // window.speechSynthesis.cancel();
  
    // Create the utterance
    const utterance = new SpeechSynthesisUtterance(text);
  
    // Retrieve stored user preferences
    const storedVoiceName = localStorage.getItem('ttsVoice') || null;
    const storedPitch = parseFloat(localStorage.getItem('ttsPitch')) || 1.0;
    const storedRate = parseFloat(localStorage.getItem('ttsRate')) || 1.0;
    const storedVolume = parseFloat(localStorage.getItem('ttsVolume')) || 1.0;
  
    // Wait for voices to be loaded (some browsers need this)
    // Ensures functionality across all browsers
    const voices = window.speechSynthesis.getVoices();
  
    // If user has a preferred voice, find it among available voices
    if (storedVoiceName && voices.length > 0) {
      const selectedVoice = voices.find(voice => voice.name === storedVoiceName);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    // Apply pitch, rate, and volume
    utterance.pitch = storedPitch;
    utterance.rate = storedRate;
    utterance.volume = storedVolume;
  
    // Speak it
    window.speechSynthesis.speak(utterance);
  }

  // Set the user's TTS preferences (voice, pitch, rate, volume, enabled)
  export function setUserTTSPreferences({ voiceName, pitch, rate, volume, enabled }) {
    if (typeof voiceName === 'string') {
      localStorage.setItem('ttsVoice', voiceName);
    }
    if (typeof pitch === 'number') {
      localStorage.setItem('ttsPitch', pitch.toString());
    }
    if (typeof rate === 'number') {
      localStorage.setItem('ttsRate', rate.toString());
    }
    if (typeof volume === 'number') {
      localStorage.setItem('ttsVolume', volume.toString());
    }
    if (typeof enabled === 'boolean') {
      localStorage.setItem('ttsEnabled', enabled.toString());
    }
  }
  
  // Returns a list of all available voices
  export function getAvailableVoices() {
    if (!window.speechSynthesis) {
      return [];
    }
    return window.speechSynthesis.getVoices();
  }
  