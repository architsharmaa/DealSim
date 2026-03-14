import { PROMPTS } from '../promptRegistry/promptRegistry.js';

export class PromptBuilder {
  static buildConversationPrompt(persona: any, context: any, transcript: string) {
    let prompt = PROMPTS.SYSTEM_INSTRUCTION;
    
    prompt += PROMPTS.BUYER_PERSONA_TEMPLATE
      .replace('{{name}}', persona.name)
      .replace('{{role}}', persona.role)
      .replace('{{company}}', persona.company)
      .replace('{{personality}}', persona.personalityTraits?.join(', '))
      .replace('{{resistanceLevel}}', persona.resistanceLevel)
      .replace('{{objections}}', persona.defaultObjections?.join(', '));

    prompt += PROMPTS.CONTEXT_TEMPLATE
      .replace('{{product}}', context.product)
      .replace('{{salesStage}}', context.salesStage)
      .replace('{{dealSize}}', context.dealSize)
      .replace('{{specialConditions}}', context.specialConditions || 'None');

    prompt += `\n# CONVERSATION HISTORY\n${transcript}\n`;
    prompt += PROMPTS.CONVERSATION_INSTRUCTIONS;

    return prompt;
  }

  static buildEvaluationPrompt(transcript: string, rubric: any) {
    return PROMPTS.EVALUATION_TEMPLATE
      .replace('{{transcript}}', transcript)
      .replace('{{rubric}}', JSON.stringify(rubric));
  }

  static buildSummaryPrompt(transcript: string) {
    return `Summarize the following sales roleplay conversation. 
Focus on the key events, buyer objections, and the outcome.
Transcript: ${transcript}
Return JSON: { "overallSummary": "...", "keyEvents": ["..."] }`;
  }

  static buildSentimentPrompt(text: string, transcript: string) {
    return PROMPTS.SENTIMENT_ANALYSIS_PROMPT
      .replace('{{text}}', text)
      .replace('{{transcript}}', transcript);
  }

  static buildCoachingPrompt(transcript: string, evaluation: any, summary: any) {
    return PROMPTS.COACHING_INSIGHTS_TEMPLATE
      .replace('{{transcript}}', transcript)
      .replace('{{evaluation}}', JSON.stringify(evaluation))
      .replace('{{summary}}', JSON.stringify(summary));
  }

  static buildCloserStrategyPrompt(transcript: string, insights: any, summary: any) {
    return (PROMPTS as any).CLOSER_STRATEGY_TEMPLATE
      .replace('{{transcript}}', transcript)
      .replace('{{insights}}', JSON.stringify(insights))
      .replace('{{summary}}', JSON.stringify(summary));
  }
}
