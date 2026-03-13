export class JsonExtractor {
  /**
   * Attempts to extract and parse JSON from a string that might contain markdown blocks
   * or other conversational filler.
   */
  static extractAndParse<T>(text: string): T {
    const trimmed = text.trim();
    try {
      // 1. Try direct parse first
      return JSON.parse(trimmed);
    } catch (e) {
      // 2. Aggressively clean the string of common markdown wrapper patterns
      let cleaned = trimmed
        .replace(/^```json\s*/i, '') // Start of json block
        .replace(/^```\s*/, '')     // Start of generic block
        .replace(/^"""json\s*/i, '') // Start of triple quote json
        .replace(/^"""\s*/, '')      // Start of triple quote generic
        .replace(/\s*```$/m, '')     // End of block
        .replace(/\s*"""$/m, '')     // End of triple quotes
        .trim();

      try {
        return JSON.parse(cleaned);
      } catch (innerError) {
        // 3. Last ditch effort: find first { and last }
        const firstBrace = cleaned.indexOf('{');
        const lastBrace = cleaned.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          const candidate = cleaned.substring(firstBrace, lastBrace + 1);
          try {
            return JSON.parse(candidate);
          } catch (bracesError) {
            console.error('[JsonExtractor] Braces extraction failed:', bracesError);
          }
        }
        throw new Error(`Failed to extract valid JSON from LLM: ${cleaned.substring(0, 50)}...`);
      }
    }
  }
}
