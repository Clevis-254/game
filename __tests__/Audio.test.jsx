import {
  playSoundEffect,
  playVoiceDialogue,
  playMusic,
  setUserAudioPreferences,
  getEqualizerSettings,
  updateEqualizerSettings,
} from '../src/utility/Audio';

// Mocking global Audio and AudioContext
class MockAudio {
  constructor() {
    this.play = jest.fn().mockResolvedValue(undefined);
    this.pause = jest.fn();
    this.volume = 1;
    this.loop = false;
    this.src = '';
    this.addEventListener = jest.fn();
    this.removeEventListener = jest.fn();
  }
}

global.Audio = MockAudio;

class MockBiquadFilterNode {
  constructor() {
    this.type = '';
    this.frequency = { value: 0 };
    this.gain = { value: 0 };
    this.Q = { value: 0 };
    this.connect = jest.fn();
    this.disconnect = jest.fn();
  }
}

class MockAudioContext {
  constructor() {
    this.destination = {};
    this.createMediaElementSource = jest.fn(() => ({
      connect: jest.fn(),
      disconnect: jest.fn(),
    }));
    this.createBiquadFilter = jest.fn(() => new MockBiquadFilterNode());
  }
}

global.AudioContext = MockAudioContext;
global.webkitAudioContext = MockAudioContext;

// Mocking localStorage
let mockLocalStorage = {};

beforeEach(() => {
  mockLocalStorage = {};
  jest.spyOn(global, 'localStorage', 'get').mockImplementation(() => ({
    getItem: jest.fn((key) => mockLocalStorage[key]),
    setItem: jest.fn((key, value) => {
      mockLocalStorage[key] = value;
    }),
    clear: jest.fn(() => {
      mockLocalStorage = {};
    }),
  }));

  jest.clearAllMocks();
});

describe('Audio Utilities', () => {
  test('getEqualizerSettings should return parsed settings from localStorage', () => {
    mockLocalStorage.equalizerSettings = JSON.stringify({
      bass: 1.5,
      mid: 1.0,
      treble: 0.8,
    });

    const settings = getEqualizerSettings();
    expect(settings).toEqual({ bass: 1.5, mid: 1.0, treble: 0.8 });
  });
});
