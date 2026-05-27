import { BackgroundCheckResult } from '../entities/background-check-result.entity';

// MOCK — Replace with real LLM integration (e.g. OpenAI, Anthropic)
export function summarizeResultsWithLlm(
  results: BackgroundCheckResult[],
): string {
  const sources = results.map((r) => r.source).join(', ');
  const verdicts = results.map((r) => r.normalizedVerdict).join(', ');
  return `Background check completed across ${results.length} source(s): [${sources}]. Verdicts: [${verdicts}]. No adverse findings detected.`;
}
