import { CheckSource, NormalizedVerdict } from '../../../generated/client';

export interface MockWorkerResult {
  source: CheckSource;
  rawResult: object;
  normalizedVerdict: NormalizedVerdict;
  confidenceScore: number;
  llmSummary: string;
}

// MOCK — Replace with real Bright Data MCP integration
export function runOfacCheck(entityName: string): MockWorkerResult {
  return {
    source: CheckSource.ofac,
    rawResult: { query: entityName, matches: [] },
    normalizedVerdict: NormalizedVerdict.clear,
    confidenceScore: 0.95,
    llmSummary: `No OFAC matches found for "${entityName}".`,
  };
}

// MOCK — Replace with real Bright Data LinkedIn Dataset
export function runLinkedInCheck(entityName: string): MockWorkerResult {
  return {
    source: CheckSource.linkedin,
    rawResult: { query: entityName, profiles: [] },
    normalizedVerdict: NormalizedVerdict.clear,
    confidenceScore: 0.8,
    llmSummary: `LinkedIn profile corroborates identity for "${entityName}".`,
  };
}

// MOCK — Replace with real Bright Data OpenSanctions integration
export function runSanctionsCheck(entityName: string): MockWorkerResult {
  return {
    source: CheckSource.opensanctions,
    rawResult: { query: entityName, hits: [] },
    normalizedVerdict: NormalizedVerdict.clear,
    confidenceScore: 0.9,
    llmSummary: `No sanctions matches found for "${entityName}".`,
  };
}

// MOCK — Replace with real Bright Data SERP API
export function runSerpCheck(entityName: string): MockWorkerResult {
  return {
    source: CheckSource.serp,
    rawResult: { query: `${entityName} fraud`, results: [] },
    normalizedVerdict: NormalizedVerdict.clear,
    confidenceScore: 0.85,
    llmSummary: `No adverse news found in search results for "${entityName}".`,
  };
}

// MOCK — Replace with real Bright Data News Scraper API
export function runNewsCheck(entityName: string): MockWorkerResult {
  return {
    source: CheckSource.news,
    rawResult: { query: entityName, articles: [] },
    normalizedVerdict: NormalizedVerdict.clear,
    confidenceScore: 0.85,
    llmSummary: `No negative news coverage found for "${entityName}".`,
  };
}

// MOCK — Runs all mock workers and returns combined results
export function runAllMockChecks(entityName: string): MockWorkerResult[] {
  return [
    runOfacCheck(entityName),
    runLinkedInCheck(entityName),
    runSanctionsCheck(entityName),
    runSerpCheck(entityName),
    runNewsCheck(entityName),
  ];
}
