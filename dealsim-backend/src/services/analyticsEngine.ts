export const FILLER_WORDS = ['um', 'uh', 'like', 'so', 'actually', 'basically', 'you know', 'i mean'];

export interface AnalyticsSnapshot {
  timestamp: Date;
  wpm: number;
  fillerWords: Record<string, number>;
  talkRatio: number;
  monologueFlag: boolean;
  buyerSentiment: 'positive' | 'neutral' | 'negative';
}

export const calculateWordsPerMinute = (transcripts: any[], startedAt: Date): number => {
  const sellerMessages = transcripts.filter(t => t.speaker === 'seller');
  if (sellerMessages.length === 0) return 0;

  const now = new Date().getTime();
  const twoMinutesAgo = now - 120000;
  
  // Filter for messages in the last 2 minutes
  let recentMessages = sellerMessages.filter(t => new Date(t.timestamp).getTime() > twoMinutesAgo);
  
  // If no messages in the last 2 mins, just use the single most recent one to give a "current" reading
  if (recentMessages.length === 0) {
    recentMessages = [sellerMessages[sellerMessages.length - 1]];
  }

  const totalWords = recentMessages.reduce((sum, t) => sum + t.content.split(/\s+/).length, 0);
  
  // Determine the baseline: when did the current "active" segment start?
  const windowStartTime = new Date(recentMessages[0].timestamp).getTime();
  
  // Duration is from window start until now, plus a small buffer (5s) 
  // to avoid infinite WPM on a single quick message.
  const minutesElapsed = (now - windowStartTime + 5000) / 60000;
  
  const wpm = Math.round(totalWords / minutesElapsed);
  
  // Sanity check: cap at 300
  return Math.min(wpm, 300);
};

export const detectFillerWords = (message: string): Record<string, number> => {
  const counts: Record<string, number> = {};
  
  FILLER_WORDS.forEach(filler => {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = message.match(regex);
    if (matches) {
      counts[filler] = matches.length;
    }
  });
  
  return counts;
};

export const calculateTalkRatio = (transcripts: any[]): number => {
  // Use a window of the last 10 turns (5 exchanges) for live responsiveness
  const windowedTranscripts = transcripts.slice(-10);
  
  let sellerWords = 0;
  let buyerWords = 0;
  
  windowedTranscripts.forEach(t => {
    const wordCount = t.content.split(/\s+/).length;
    if (t.speaker === 'seller') {
      sellerWords += wordCount;
    } else {
      buyerWords += wordCount;
    }
  });
  
  const totalWords = sellerWords + buyerWords;
  if (totalWords === 0) return 0;
  
  return Math.round((sellerWords / totalWords) * 100);
};

export const detectMonologue = (message: string): boolean => {
  const wordCount = message.split(/\s+/).length;
  return wordCount > 80; // Flag as monologue if more than 80 words in a single turn
};

export const logAnalyticsSnapshot = (sessionId: string, snapshot: AnalyticsSnapshot) => {
  console.log(JSON.stringify({
    event: "analytics_snapshot",
    sessionId,
    wpm: snapshot.wpm,
    talkRatio: snapshot.talkRatio,
    fillerWords: snapshot.fillerWords,
    buyerSentiment: snapshot.buyerSentiment,
    timestamp: snapshot.timestamp
  }));
};
