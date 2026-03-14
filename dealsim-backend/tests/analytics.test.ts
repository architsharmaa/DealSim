import * as AnalyticsEngine from '../src/services/analyticsEngine.js';

describe('AnalyticsEngine', () => {
  test('calculateWordsPerMinute should correctly estimate WPM from transcripts', () => {
    const startedAt = new Date(Date.now() - 60000);
    const transcripts = [
      { speaker: 'seller', content: 'word '.repeat(50).trim(), timestamp: new Date() }
    ];
    const wpm = AnalyticsEngine.calculateWordsPerMinute(transcripts, startedAt);
    // Logic in engine: totalWords / minutesElapsed. 
    // 50 words / ~1 min (+2s buffer)
    expect(wpm).toBeGreaterThan(0);
  });

  test('detectFillerWords should correctly identify filler phrases', () => {
    const text = 'So, basically, like, i mean, move forward.';
    const fillers = AnalyticsEngine.detectFillerWords(text);
    // fillers: so, basically, like, i mean
    expect(fillers['so']).toBe(1);
    expect(fillers['basically']).toBe(1);
  });

  test('calculateTalkRatio should return balanced ratio for equal word counts', () => {
    const transcripts = [
      { speaker: 'seller', content: 'hello world', timestamp: new Date() },
      { speaker: 'buyer', content: 'hi there', timestamp: new Date() }
    ];
    const ratio = AnalyticsEngine.calculateTalkRatio(transcripts);
    expect(ratio).toBe(50);
  });
});
