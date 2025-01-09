import { startSpeechRecognition, stopSpeechRecognition, getRecognitionResult } from '../src/utility/SpeechToText';

describe('SpeechToText Utility', () => {
    let recognitionMock;
    let startMock;
    let stopMock;
    let onresultMock;
    let onerrorMock;

    beforeEach(() => {
        // Mock the SpeechRecognition API
        startMock = jest.fn();
        stopMock = jest.fn();
        onresultMock = jest.fn();
        onerrorMock = jest.fn();

        recognitionMock = {
            start: startMock,
            stop: stopMock,
            onresult: onresultMock,
            onerror: onerrorMock,
        };

        global.window.SpeechRecognition = jest.fn(() => recognitionMock);
        global.window.webkitSpeechRecognition = jest.fn(() => recognitionMock);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should start speech recognition', () => {
        startSpeechRecognition();

        expect(startMock).toHaveBeenCalled();
    });

    test('should stop speech recognition', () => {
        stopSpeechRecognition();

        expect(stopMock).toHaveBeenCalled();
    });

    test('should return recognition result', () => {
        const mockEvent = {
            results: [
                {
                    isFinal: true,
                    0: { transcript: 'Hello World' },
                },
            ],
        };

        recognitionMock.onresult(mockEvent);

        const result = getRecognitionResult();
        expect(result).toBe('Hello World');
    });

    test('should handle recognition errors', () => {
        const mockErrorEvent = { error: 'network' };

        recognitionMock.onerror(mockErrorEvent);

        const result = getRecognitionResult();
        expect(result).toBe(null);
    });
});
