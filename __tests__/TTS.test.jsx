import { speakText, speakText2, setUserTTSPreferences, getAvailableVoices } from '../src/utility/Speech';

// Mocking the SpeechSynthesisUtterance class
global.SpeechSynthesisUtterance = class {
    constructor(text) {
        this.text = text;
        this.lang = '';
        this.volume = 1;
        this.rate = 1;
        this.pitch = 1;
        this.onend = null;
        this.onerror = null;
    }
};

describe('speakText Functionality', () => {
    let speechSynthesisMock;
    let speakMock;
    let cancelMock;
    let getVoicesMock;

    beforeEach(() => {
        // Mock the speechSynthesis API
        speakMock = jest.fn();
        cancelMock = jest.fn();
        getVoicesMock = jest.fn(() => [{ name: 'Mock Voice', lang: 'en-US' }]);

        speechSynthesisMock = {
            speak: speakMock,
            cancel: cancelMock,
            getVoices: getVoicesMock,
            onvoiceschanged: null,
        };

        global.window.speechSynthesis = speechSynthesisMock;
        localStorage.clear();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should not call speak if SpeechSynthesis is not supported', () => {
        // Remove speechSynthesis from global window object
        delete global.window.speechSynthesis;

        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        speakText('Hello World');

        // Verify that a warning is logged
        expect(consoleWarnSpy).toHaveBeenCalledWith('SpeechSynthesis not supported by this browser.');

        consoleWarnSpy.mockRestore();
    });

    test('should not call speak if TTS is disabled', () => {
        // Disable TTS in localStorage
        localStorage.setItem('ttsEnabled', 'false');

        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        speakText('Hello World');

        // Verify that a warning is logged and speak is not called
        expect(consoleWarnSpy).toHaveBeenCalledWith('TTS is disabled.');
        expect(speakMock).not.toHaveBeenCalled();

        consoleWarnSpy.mockRestore();
    });

    test('should call speak with correct preferences', () => {
        // Set TTS preferences in localStorage
        localStorage.setItem('ttsEnabled', 'true');
        localStorage.setItem('ttsVoice', 'Mock Voice');
        localStorage.setItem('ttsPitch', '1.2');
        localStorage.setItem('ttsRate', '1.5');
        localStorage.setItem('ttsVolume', '0.8');

        speakText('Hello World');

        // Verify that speak is called with correct preferences
        expect(speakMock).toHaveBeenCalled();

        const utterance = speakMock.mock.calls[0][0];
        expect(utterance.text).toBe('Hello World');
        expect(utterance.pitch).toBe(1.2);
        expect(utterance.rate).toBe(1.5);
        expect(utterance.volume).toBe(0.8);
        expect(utterance.voice.name).toBe('Mock Voice');
    });

    test('should handle missing voice gracefully', () => {
        // Set a nonexistent voice in localStorage
        localStorage.setItem('ttsEnabled', 'true');
        localStorage.setItem('ttsVoice', 'Nonexistent Voice');

        speakText('Hello World');

        // Verify that speak is called and voice is undefined
        expect(speakMock).toHaveBeenCalled();

        const utterance = speakMock.mock.calls[0][0];
        expect(utterance.voice).toBeUndefined();
    });

});

describe('TTS Preferences', () => {
    test('should set user preferences correctly', () => {
        const preferences = {
            voiceName: 'Mock Voice',
            pitch: 1.5,
            rate: 1.2,
            volume: 0.9,
            enabled: true,
        };

        setUserTTSPreferences(preferences);

        // Verify that preferences are stored in localStorage
        expect(localStorage.getItem('ttsVoice')).toBe('Mock Voice');
        expect(localStorage.getItem('ttsPitch')).toBe('1.5');
        expect(localStorage.getItem('ttsRate')).toBe('1.2');
        expect(localStorage.getItem('ttsVolume')).toBe('0.9');
        expect(localStorage.getItem('ttsEnabled')).toBe('true');
    });

    test('should return available voices', () => {
        const voices = getAvailableVoices();
        // Verify that the correct voices are returned
        expect(voices).toEqual([{ name: 'Mock Voice', lang: 'en-US' }]);
    });
});
