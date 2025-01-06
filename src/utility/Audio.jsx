import React from 'react';

// Singleton AudioContext to manage resources effectively
let audioContext = null;

//Function to get or create the singleton AudioContext
function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

// Utility to convert linear gain to decibels
const linearToDecibels = (linear) => 20 * Math.log10(linear);

// Object to keep track of active audio elements and their filters
const activeAudioElements = new Set();

// Apply equalizer settings to an audio element
function applyEqualizer(audio, equalizerSettings) {
  const context = getAudioContext();

  // Create a MediaElementSource from the audio element
  const source = context.createMediaElementSource(audio);

  //Craete BiquadFilterNodes for Bass, Mid, and Treble
  // Filter for Bass frequencies
  const bassFilter = context.createBiquadFilter();
  bassFilter.type = 'lowshelf';
  bassFilter.frequency.value = 200;
  bassFilter.gain.value = linearToDecibels(equalizerSettings.bass);

  // Filter for Mid frequencies
  const midFilter = context.createBiquadFilter();
  midFilter.type = 'peaking';
  midFilter.frequency.value = 1000;
  midFilter.Q.value = 1; // Quality factor
  midFilter.gain.value = linearToDecibels(equalizerSettings.mid);

  // Treble filter for high frequencies
  const trebleFilter = context.createBiquadFilter();
  trebleFilter.type = 'highshelf';
  trebleFilter.frequency.value = 3000;
  trebleFilter.gain.value = linearToDecibels(equalizerSettings.treble);

  // Connect the nodes: source > bass > mid > treble > destination
  source.connect(bassFilter);
  bassFilter.connect(midFilter);
  midFilter.connect(trebleFilter);
  trebleFilter.connect(context.destination);

  // Store filter references for real-time updates
  audio._filters = { bassFilter, midFilter, trebleFilter };

  // Add to active audio elements
  activeAudioElements.add(audio);

  // Cleanup when the audio ends
  const cleanup = () => {
    source.disconnect();
    bassFilter.disconnect();
    midFilter.disconnect();
    trebleFilter.disconnect();
    activeAudioElements.delete(audio);
  };

  // Listen for audio end, pause, or error events
  audio.addEventListener('ended', cleanup);
  audio.addEventListener('pause', cleanup);
  audio.addEventListener('error', cleanup);
}

// Update all active audio elements with new equalizer settings
export function updateEqualizerSettings(equalizerSettings) {
  activeAudioElements.forEach((audio) => {
    if (audio._filters) {
      const { bassFilter, midFilter, trebleFilter } = audio._filters;
      bassFilter.gain.value = linearToDecibels(equalizerSettings.bass);
      midFilter.gain.value = linearToDecibels(equalizerSettings.mid);
      trebleFilter.gain.value = linearToDecibels(equalizerSettings.treble);
    }
  });
}

// Play a sound effect
export function playSoundEffect(src) {
  try {
    // Retrieve stored user preferences
    const storedSoundVolume = parseFloat(localStorage.getItem('soundEffectVolume')) || 1.0;
    const storedMasterVolume = parseFloat(localStorage.getItem('masterVolume')) || 1.0;

    // Create and configure the audio element
    const audio = new Audio(src);
    audio.volume = storedSoundVolume * storedMasterVolume;

    // Apply equalizer settings
    const equalizerSettings = getEqualizerSettings();
    applyEqualizer(audio, equalizerSettings);

    // Play the sound effect
    audio.play().catch((error) => {
      console.error('Error playing sound effect:', error);
    });
  } catch (error) {
    console.error('Failed to play sound effect:', error);
  }
}

// Play a voice dialogue line
export function playVoiceDialogue(src) {
  try {
    // Retrieve stored user preferences
    const storedVoiceVolume = parseFloat(localStorage.getItem('voiceDialogueVolume')) || 1.0;
    const storedMasterVolume = parseFloat(localStorage.getItem('masterVolume')) || 1.0;

    // Create and configure the audio element
    const audio = new Audio(src);
    audio.volume = storedVoiceVolume * storedMasterVolume;

    // Apply equalizer settings
    const equalizerSettings = getEqualizerSettings();
    applyEqualizer(audio, equalizerSettings);

    // Play the voice dialogue
    audio.play().catch((error) => {
      console.error('Error playing voice dialogue:', error);
    });
  } catch (error) {
    console.error('Failed to play voice dialogue:', error);
  }
}

// Play background music
export function playMusic(src) {
  try {
    // Retrieve stored user preferences
    const storedMusicVolume = parseFloat(localStorage.getItem('musicVolume')) || 1.0;
    const storedMasterVolume = parseFloat(localStorage.getItem('masterVolume')) || 1.0;

    // Create and configure the audio element
    const audio = new Audio(src);
    audio.volume = storedMusicVolume * storedMasterVolume;
    audio.loop = true; // Optional: Loop background music

    // Apply equalizer settings
    const equalizerSettings = getEqualizerSettings();
    applyEqualizer(audio, equalizerSettings);

    // Play the background music
    audio.play().catch((error) => {
      console.error('Error playing music:', error);
    });
  } catch (error) {
    console.error('Failed to play music:', error);
  }
}

// Set the users audio preferences (master volume, sfx, voice, music, equalizer)
export function setUserAudioPreferences({ masterVolume, soundEffectVolume, voiceDialogueVolume, musicVolume, equalizerSettings }) {
  try {
    if (typeof masterVolume === 'number') {
      localStorage.setItem('masterVolume', masterVolume.toString());
    }
    if (typeof soundEffectVolume === 'number') {
      localStorage.setItem('soundEffectVolume', soundEffectVolume.toString());
    }
    if (typeof voiceDialogueVolume === 'number') {
      localStorage.setItem('voiceDialogueVolume', voiceDialogueVolume.toString());
    }
    if (typeof musicVolume === 'number') {
      localStorage.setItem('musicVolume', musicVolume.toString());
    }
    if (equalizerSettings) {
      localStorage.setItem('equalizerSettings', JSON.stringify(equalizerSettings));
      // Update active audio elements with new equalizer settings
      updateEqualizerSettings(equalizerSettings);
    }
  } catch (error) {
    console.error('Failed to set user audio preferences:', error);
  }
};

// Get equalizer settings
export function getEqualizerSettings() {
  try {
    // Retrieve stored equalizer settings or use default values
    const storedEqualizerSettings = localStorage.getItem('equalizerSettings');
    return storedEqualizerSettings
      ? JSON.parse(storedEqualizerSettings)
      : { bass: 1.0, mid: 1.0, treble: 1.0 };
  } catch (error) {
    console.error('Failed to get equalizer settings:', error);
    return { bass: 1.0, mid: 1.0, treble: 1.0 };
  }
}
