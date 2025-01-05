import React from 'react';

// Play a sound effect
export function playSoundEffect(src) {
  // retrieve stored user preferences
  const storedSoundVolume = parseFloat(localStorage.getItem('soundEffectVolume')) || 1.0;
  const storedMasterVolume = parseFloat(localStorage.getItem('masterVolume')) || 1.0;

  // Play the sfx
  const audio = new Audio(src);
  audio.volume = storedSoundVolume * storedMasterVolume; // apply master volume
  audio.play().catch((error) => {
    console.error('Error playing voice dialogue:', error);
  });
  }

// Play a voice line
export function playVoiceDialogue(src) {
  // retrieve stored user preferences
  const storedVoiceVolume = parseFloat(localStorage.getItem('voiceDialogueVolume')) || 1.0;
  const storedMasterVolume = parseFloat(localStorage.getItem('masterVolume')) || 1.0;

  // Play the voice line
  const audio = new Audio(src);
  audio.volume = storedVoiceVolume * storedMasterVolume;
  audio.play().catch((error) => {
    console.error('Error playing voice dialogue:', error);
  });
}

// Play background music
export function playMusic(src) {
  const storedMusicVolume = parseFloat(localStorage.getItem('musicVolume')) || 1.0;
  const storedMasterVolume = parseFloat(localStorage.getItem('masterVolume')) || 1.0;

    const audio = new Audio(src);
    audio.volume = storedMusicVolume * storedMasterVolume;
    audio.play().catch((error) => {
      console.error('Error playing music:', error);
    });
  }


  // Set the user's audio preferences (master volume, sfx, voice, music)
  export function setUserAudioPreferences({ masterVolume, soundEffectVolume, voiceDialogueVolume, musicVolume }) {
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
  };