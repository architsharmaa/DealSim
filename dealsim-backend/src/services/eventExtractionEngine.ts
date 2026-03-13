import type { ITranscriptEntry } from '../models/Session.js';

export interface IKeyEvent {
  type: 'discovery_question' | 'objection_raised' | 'value_proposition' | 'pricing_discussion' | 'closing_attempt';
  message: string;
  speaker: string;
  timestamp: Date;
}

const DETECTION_RULES = [
  {
    type: 'discovery_question',
    speaker: 'seller',
    patterns: [
      /how are you currently handling/i,
      /what tools are you using today/i,
      /what challenges are you facing/i,
      /tell me more about your process/i,
      /what are your main goals/i,
      /who else is involved/i
    ]
  },
  {
    type: 'objection_raised',
    speaker: 'buyer',
    patterns: [
      /too expensive/i,
      /not interested/i,
      /already have a solution/i,
      /budget constraints/i,
      /not a priority/i,
      /security concerns/i,
      /sounds complicated/i
    ]
  },
  {
    type: 'value_proposition',
    speaker: 'seller',
    patterns: [
      /our platform helps reduce/i,
      /you can save time by/i,
      /specializes in automating/i,
      /provides full visibility into/i,
      /the main benefit is/i
    ]
  },
  {
    type: 'pricing_discussion',
    speaker: 'any',
    patterns: [
      /\bprice\b/i,
      /\bcost\b/i,
      /\bbudget\b/i,
      /\broi\b/i,
      /\bpricing\b/i,
      /how much does it cost/i
    ]
  },
  {
    type: 'closing_attempt',
    speaker: 'seller',
    patterns: [
      /would you be open to a demo/i,
      /should we schedule a follow-up/i,
      /what are the next steps/i,
      /ready to move forward/i,
      /how does that sound for a start/i
    ]
  }
];

export const extractEvents = (message: ITranscriptEntry): IKeyEvent[] => {
  const detectedEvents: IKeyEvent[] = [];
  const content = message.content;

  DETECTION_RULES.forEach(rule => {
    // Check speaker if specific speaker is required
    if (rule.speaker !== 'any' && rule.speaker !== message.speaker) {
      return;
    }

    const matches = rule.patterns.some(pattern => pattern.test(content));
    if (matches) {
      detectedEvents.push({
        type: rule.type as any,
        message: content,
        speaker: message.speaker,
        timestamp: message.timestamp || new Date()
      });
    }
  });

  return detectedEvents;
};
