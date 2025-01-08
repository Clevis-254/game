import React from 'react';

// Spaek text function using the Web Speech API
// To call the function for multiple texts use speakText([text1, text2, text3], delayTime)
// To call the function for a single text use speakText([text])
// adjust delay time as desired
export function speakText(texts, delayTime = 1000) {
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
  window.speechSynthesis.cancel();

  // Retrieve stored user preferences
  const storedVoiceName = localStorage.getItem('ttsVoice') || null;
  const storedPitch = parseFloat(localStorage.getItem('ttsPitch')) || 1.0;
  const storedRate = parseFloat(localStorage.getItem('ttsRate')) || 1.0;
  const storedVolume = parseFloat(localStorage.getItem('ttsVolume')) || 1.0;

  // Function to speak a single text
  const speakText = (text) => {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = storedPitch;
      utterance.rate = storedRate;
      utterance.volume = storedVolume;

      if (storedVoiceName) {
        const voices = window.speechSynthesis.getVoices();
        utterance.voice = voices.find(voice => voice.name === storedVoiceName);
      }

      utterance.onend = resolve;
      window.speechSynthesis.speak(utterance);
    });
  };

  // Function to speak all texts sequentially with a delay
  const speakAllTexts = async () => {
    // Wait for voices to be loaded
    await new Promise((resolve) => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length !== 0) {
        resolve();
      } else {
        window.speechSynthesis.onvoiceschanged = resolve;
      }
    });

    for (const text of texts) {
      await speakText(text);
      await new Promise(resolve => setTimeout(resolve, delayTime));
    }
  };

  speakAllTexts();
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

export default speakText;