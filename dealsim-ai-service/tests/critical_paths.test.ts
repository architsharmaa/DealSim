import { JsonExtractor } from '../src/utils/jsonExtractor.js';
import { PromptBuilder } from '../src/services/promptBuilder/promptBuilder.js';

describe('AI Service Critical Paths', () => {
  describe('JsonExtractor', () => {
    test('should extract JSON from markdown code blocks', () => {
      const raw = 'Here is the result:\n```json\n{"score": 5}\n```\nHope that helps.';
      const result = JsonExtractor.extractAndParse(raw);
      expect(result.score).toBe(5);
    });

    test('should parse raw JSON strings', () => {
      const raw = '{"status": "ok"}';
      const result = JsonExtractor.extractAndParse(raw);
      expect(result.status).toBe('ok');
    });

    test('should throw error on invalid JSON', () => {
      const raw = 'Not JSON at all';
      expect(() => JsonExtractor.extractAndParse(raw)).toThrow();
    });
  });

  describe('PromptBuilder', () => {
    test('should inject transcript and rubric into evaluation prompt', () => {
      const transcript = 'test transcript';
      const rubric = [{ name: 'test rubric' }];
      const prompt = PromptBuilder.buildEvaluationPrompt(transcript, rubric);
      expect(prompt).toContain(transcript);
      expect(prompt).toContain('test rubric');
    });
  });
});
