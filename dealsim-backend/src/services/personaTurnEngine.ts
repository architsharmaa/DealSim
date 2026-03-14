/**
 * PersonaTurnEngine
 * 
 * Deterministically selects which buying committee persona should respond
 * based on the seller's message content, topic relevance, and previous speaker.
 */

export interface ICommitteeMember {
  _id: string;
  name: string;
  role: string;
  priorities?: string[];
  communicationStyle?: string;
  defaultObjections?: string[];
  personalityTraits?: string[];
  resistanceLevel?: string;
  company?: string;
}

interface TurnDecision {
  persona: ICommitteeMember;
  isFirstAppearance: boolean;
  introductionLine?: string;
}

// Topic-to-role keyword mapping
const TOPIC_KEYWORDS: Record<string, string[]> = {
  budget:       ['budget', 'cost', 'price', 'pricing', 'afford', 'investment', 'roi', 'spend', 'financial', 'revenue', 'risk'],
  technical:    ['integration', 'api', 'security', 'data', 'technical', 'implementation', 'architecture', 'infra', 'cloud', 'compliance', 'sso', 'sla'],
  operational:  ['workflow', 'team', 'users', 'adoption', 'training', 'process', 'daily', 'onboard', 'productivity', 'support', 'leadership'],
  meta:         ['who', 'meeting', 'room', 'participants', 'everyone', 'team', 'join', 'introduce', 'lead'],
};

// Maps topic category to a role keyword match (partial match on the persona's role field)
const ROLE_TOPIC_MAP: Record<string, string[]> = {
  budget:      ['cfo', 'finance', 'financial', 'vp finance', 'chief financial'],
  technical:   ['cto', 'it', 'engineer', 'architect', 'security', 'dev', 'technical', 'director of engineering'],
  operational: ['user', 'operations', 'manager', 'vp', 'director', 'end user', 'business', 'lead'],
  meta:        ['vp', 'director', 'manager', 'lead', 'chief', 'head'],
};

/**
 * Detect topic category of the seller's latest message
 */
function detectTopics(message: string): string[] {
  const lower = message.toLowerCase();
  const matched: string[] = [];
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      matched.push(topic);
    }
  }
  return matched;
}

/**
 * Score each persona by how well their role matches the detected topic(s)
 */
function scorePersonaForTopics(persona: ICommitteeMember, topics: string[]): number {
  const roleL = persona.role.toLowerCase();
  let score = 0;
  for (const topic of topics) {
    const roleKeywords = ROLE_TOPIC_MAP[topic] || [];
    if (roleKeywords.some(kw => roleL.includes(kw))) {
      score += 25;
    }
  }
  return score;
}

/**
 * Main export: selects next speaker from the buying committee.
 * @param sellerMessage    The seller's latest message
 * @param committee        All committee persona objects
 * @param lastSpeakerName  Name of the last persona who spoke (to avoid repeats)
 * @param spokenPersonaIds Set of persona IDs that have already spoken at least once
 */
export function selectNextPersona(
  sellerMessage: string,
  committee: ICommitteeMember[],
  lastSpeakerName: string | null,
  spokenPersonaIds: Set<string>
): TurnDecision {
  const topics = detectTopics(sellerMessage);

  // Score each committee member
  const scored = committee.map(persona => {
    let score = scorePersonaForTopics(persona, topics);
    // Penalise repeat speaker
    if (persona.name === lastSpeakerName) score -= 5;
    return { persona, score };
  });

  // Pick highest scoring, defaulting to round-robin if all tied at 0
  scored.sort((a, b) => b.score - a.score);
  const winner = scored[0]!.persona;

  const isFirstAppearance = !spokenPersonaIds.has(String(winner._id));

  // Generate a natural introduction line when a new persona enters
  const result: TurnDecision = { persona: winner, isFirstAppearance };
  if (isFirstAppearance && spokenPersonaIds.size > 0) {
    const introducer = committee.find(p => spokenPersonaIds.has(String(p._id)) && p.name !== winner.name);
    const intro = introducer ? `${introducer.name}` : `One of the team members`;
    result.introductionLine = `[${intro} turns to address the room] Let me bring in our ${winner.role} to weigh in on this — ${winner.name}.`;
  }

  return result;
}

/**
 * Build a system prompt fragment for a specific committee persona
 */
export function buildPersonaPrompt(persona: ICommitteeMember): string {
  return `
## ACTIVE SPEAKER: ${persona.name} (${persona.role})
Company: ${persona.company || 'Unknown'}
Communication Style: ${persona.communicationStyle || 'Professional'}
Priorities: ${(persona.priorities || persona.personalityTraits || []).join(', ')}
Key Objections: ${(persona.defaultObjections || []).join('; ')}
Resistance Level: ${persona.resistanceLevel || 'medium'}

Respond ONLY as ${persona.name}. Stay in character. Your response should reflect your priorities and role.
`.trim();
}
