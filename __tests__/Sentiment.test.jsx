import { analyzeSentiment, getSentimentScore } from '../src/utility/Sentiment';

describe('Sentiment Analysis Utility', () => {
    test('should analyze sentiment correctly for positive text', () => {
        const text = 'I love programming!';
        const result = analyzeSentiment(text);
        expect(result).toEqual({ score: 1, comparative: 0.25, tokens: ['I', 'love', 'programming'], words: ['love'], positive: ['love'], negative: [] });
    });

    test('should analyze sentiment correctly for negative text', () => {
        const text = 'I hate bugs!';
        const result = analyzeSentiment(text);
        expect(result).toEqual({ score: -1, comparative: -0.25, tokens: ['I', 'hate', 'bugs'], words: ['hate'], positive: [], negative: ['hate'] });
    });

    test('should analyze sentiment correctly for neutral text', () => {
        const text = 'I am coding.';
        const result = analyzeSentiment(text);
        expect(result).toEqual({ score: 0, comparative: 0, tokens: ['I', 'am', 'coding'], words: [], positive: [], negative: [] });
    });

    test('should return correct sentiment score for positive text', () => {
        const text = 'I love programming!';
        const score = getSentimentScore(text);
        expect(score).toBe(1);
    });

    test('should return correct sentiment score for negative text', () => {
        const text = 'I hate bugs!';
        const score = getSentimentScore(text);
        expect(score).toBe(-1);
    });

    test('should return correct sentiment score for neutral text', () => {
        const text = 'I am coding.';
        const score = getSentimentScore(text);
        expect(score).toBe(0);
    });
});
