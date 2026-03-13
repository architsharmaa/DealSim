import type { ITranscriptEntry } from '../models/Session.js';

interface StateEntry {
  text: string;
  timestamp: Date;
}

interface ConversationState {
  claimsMade: StateEntry[];
  topicsCovered: StateEntry[];
  objectionsRaised: StateEntry[];
  objectionsResolved: StateEntry[];
}

const CLAIMS_KEYWORDS = ['increase', 'improve', 'reduce cost', 'save time', 'automate', 'efficient', 'roi', 'revenue', 'profit'];
const TOPICS_MAP: Record<string, string[]> = {
  'pricing': ['price', 'cost', 'expensive', 'cheap', 'budget', 'billing', 'subscription'],
  'security': ['security', 'compliance', 'data', 'safety', 'privacy', 'soc2', 'audit'],
  'integration': ['integration', 'api', 'connect', 'hook', 'system', 'workflow', 'sync'],
  'implementation': ['setup', 'implementation', 'onboarding', 'install', 'rollout', 'training'],
  'roi': ['return on investment', 'roi', 'value', 'savings', 'benefit', 'growth']
};

const OBJECTION_PATTERNS = [
  /too expensive/i,
  /already use/i,
  /security concerns/i,
  /not a priority/i,
  /it's a lot/i,
  /not sure we need/i,
  /don't have budget/i
];

export const updateConversationState = (
  transcripts: ITranscriptEntry[],
  currentState: ConversationState,
  newMessage: ITranscriptEntry
): ConversationState => {
  const newState = { 
    claimsMade: [...(currentState.claimsMade || [])],
    topicsCovered: [...(currentState.topicsCovered || [])],
    objectionsRaised: [...(currentState.objectionsRaised || [])],
    objectionsResolved: [...(currentState.objectionsResolved || [])]
  };
  const content = newMessage.content.toLowerCase();
  const timestamp = newMessage.timestamp || new Date();

  // 1. Detect Claims Made (by Seller)
  if (newMessage.speaker === 'seller') {
    CLAIMS_KEYWORDS.forEach(keyword => {
      if (content.includes(keyword)) {
        const alreadyExists = newState.claimsMade.some(c => c.text.toLowerCase() === keyword);
        if (!alreadyExists) {
          newState.claimsMade.push({ text: keyword, timestamp });
        }
      }
    });

    // 2. Detect Objections Resolved
    // If buyer raised an objection last turn, and seller is responding, we'll check buyer's next sentiment
    // This is handled better after the buyer's response, but we can mark potential resolutions here
  }

  // 3. Topics Covered (Both)
  Object.entries(TOPICS_MAP).forEach(([topic, keywords]) => {
    if (keywords.some(k => content.includes(k))) {
      const alreadyExists = newState.topicsCovered.some(t => t.text === topic);
      if (!alreadyExists) {
        newState.topicsCovered.push({ text: topic, timestamp });
      }
    }
  });

  // 4. Objections Raised (by Buyer)
  if (newMessage.speaker === 'buyer') {
    OBJECTION_PATTERNS.forEach(pattern => {
      if (pattern.test(content)) {
        const match = content.match(pattern);
        const objectionText = match ? match[0] : 'Generic Objection';
        const alreadyExists = newState.objectionsRaised.some(o => o.text.toLowerCase() === objectionText.toLowerCase());
        if (!alreadyExists) {
          newState.objectionsRaised.push({ text: objectionText, timestamp });
        }
      }
    });

    // 5. Detect Objections Resolved
    // If the buyer's last turn was an objection, and this turn they seem more positive
    if (newState.objectionsRaised.length > 0) {
      const lastObjection = newState.objectionsRaised[newState.objectionsRaised.length - 1];
      if (lastObjection) {
        // Basic resolution heuristic: if current response doesn't match any objection patterns AND has positive sentiment markers
        const isStillObjecting = OBJECTION_PATTERNS.some(p => p.test(content));
        const hasPositiveSentiment = /makes sense|understand|okay|good|great|helpful/i.test(content);
        
        if (!isStillObjecting && hasPositiveSentiment) {
          const alreadyResolved = newState.objectionsResolved.some(o => o.text === lastObjection.text);
          if (!alreadyResolved) {
            newState.objectionsResolved.push({ text: lastObjection.text, timestamp });
          }
        }
      }
    }
  }

  return newState;
};
