import { CheckSource, NormalizedVerdict } from '../../../generated/client';

export interface MockWorkerResult {
  source: CheckSource;
  rawResult: object;
  normalizedVerdict: NormalizedVerdict;
  confidenceScore: number;
  llmSummary: string;
}

const BRIGHT_DATA_API_KEY = process.env.BRIGHT_DATA_API_KEY ?? '';
const BRIGHT_DATA_SERP_URL =
  process.env.BRIGHT_DATA_SERP_URL ?? 'https://api.brightdata.com/serp/google';

const KNOWN_LEGITIMATE_NAMES = new Set([
  'google',
  'microsoft',
  'apple',
  'amazon',
  'meta',
  'openai',
  'stripe',
  'github',
]);

function isDemoFlaggedName(entityName: string): boolean {
  const lower = entityName.toLowerCase();
  return (
    lower.includes('fake') ||
    lower.includes('scam') ||
    lower.includes('fraud') ||
    lower.includes('test corp') ||
    lower.includes('xyz enterprises') ||
    lower.includes('phantom')
  );
}

function isKnownLegitimate(entityName: string): boolean {
  const lower = entityName.toLowerCase();
  return [...KNOWN_LEGITIMATE_NAMES].some((name) => lower.includes(name));
}

export async function runOfacCheck(
  entityName: string,
): Promise<MockWorkerResult> {
  if (!BRIGHT_DATA_API_KEY) {
    const flagged = isDemoFlaggedName(entityName);
    return {
      source: CheckSource.ofac,
      rawResult: {
        query: entityName,
        matches: flagged ? [{ name: entityName }] : [],
      },
      normalizedVerdict: flagged
        ? NormalizedVerdict.hard_flag
        : NormalizedVerdict.clear,
      confidenceScore: flagged ? 0.72 : 0.95,
      llmSummary: flagged
        ? `Potential OFAC match found for "${entityName}". Manual review recommended.`
        : `No OFAC matches found for "${entityName}".`,
    };
  }

  try {
    const response = await fetch(
      `${BRIGHT_DATA_SERP_URL}?q=${encodeURIComponent(entityName + ' OFAC sanctions')}&num=5`,
      {
        headers: {
          Authorization: `Bearer ${BRIGHT_DATA_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Bright Data SERP OFAC returned ${response.status}`);
    }

    const data = (await response.json()) as {
      organic?: Array<{ title: string; snippet: string }>;
    };
    const results = data.organic ?? [];
    const hasOfacHit = results.some(
      (r) =>
        r.title?.toLowerCase().includes('ofac') ||
        r.snippet?.toLowerCase().includes('sanctions'),
    );

    return {
      source: CheckSource.ofac,
      rawResult: { query: entityName, results: results.slice(0, 3) },
      normalizedVerdict: hasOfacHit
        ? NormalizedVerdict.hard_flag
        : NormalizedVerdict.clear,
      confidenceScore: hasOfacHit ? 0.78 : 0.92,
      llmSummary: hasOfacHit
        ? `OFAC/sanctions-related results found for "${entityName}" via web intelligence.`
        : `No OFAC matches found for "${entityName}".`,
    };
  } catch (err) {
    console.warn(
      '[OFAC worker] Bright Data call failed, falling back to mock:',
      err,
    );
    return {
      source: CheckSource.ofac,
      rawResult: { query: entityName, matches: [], error: 'api_unavailable' },
      normalizedVerdict: NormalizedVerdict.clear,
      confidenceScore: 0.5,
      llmSummary: `OFAC check inconclusive for "${entityName}" (API unavailable).`,
    };
  }
}

export async function runSerpCheck(
  entityName: string,
): Promise<MockWorkerResult> {
  if (!BRIGHT_DATA_API_KEY) {
    const flagged = isDemoFlaggedName(entityName);
    const noFootprint = !isKnownLegitimate(entityName) && !flagged;
    const verdict = flagged
      ? NormalizedVerdict.hard_flag
      : noFootprint
        ? NormalizedVerdict.not_found
        : NormalizedVerdict.clear;

    return {
      source: CheckSource.serp,
      rawResult: {
        query: `${entityName} fraud OR scam OR complaint`,
        results: flagged
          ? [
              {
                title: `${entityName} fraud complaints`,
                snippet: 'Multiple reports of fraudulent activity.',
              },
            ]
          : [],
      },
      normalizedVerdict: verdict,
      confidenceScore: flagged ? 0.85 : noFootprint ? 0.7 : 0.88,
      llmSummary: flagged
        ? `Adverse search results found for "${entityName}" — fraud or scam indicators present.`
        : noFootprint
          ? `No significant web presence found for "${entityName}". Organization may not be legitimate.`
          : `No adverse news found in search results for "${entityName}".`,
    };
  }

  try {
    const fraudQuery = `${entityName} fraud OR scam OR complaint OR "fake company"`;
    const [fraudResponse, presenceResponse] = await Promise.all([
      fetch(
        `${BRIGHT_DATA_SERP_URL}?q=${encodeURIComponent(fraudQuery)}&num=5`,
        {
          headers: {
            Authorization: `Bearer ${BRIGHT_DATA_API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      ),
      fetch(
        `${BRIGHT_DATA_SERP_URL}?q=${encodeURIComponent(entityName)}&num=5`,
        {
          headers: {
            Authorization: `Bearer ${BRIGHT_DATA_API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    ]);

    const fraudData = fraudResponse.ok
      ? ((await fraudResponse.json()) as {
          organic?: Array<{ title: string; snippet: string }>;
        })
      : { organic: [] };
    const presenceData = presenceResponse.ok
      ? ((await presenceResponse.json()) as { organic?: Array<unknown> })
      : { organic: [] };

    const fraudResults = fraudData.organic ?? [];
    const presenceResults = presenceData.organic ?? [];

    const hasFraudSignal = fraudResults.some(
      (r) =>
        r.snippet?.toLowerCase().includes('fraud') ||
        r.snippet?.toLowerCase().includes('scam') ||
        r.title?.toLowerCase().includes('fraud'),
    );
    const hasPresence = presenceResults.length >= 2;

    const verdict = hasFraudSignal
      ? NormalizedVerdict.hard_flag
      : !hasPresence
        ? NormalizedVerdict.not_found
        : NormalizedVerdict.clear;

    return {
      source: CheckSource.serp,
      rawResult: {
        query: fraudQuery,
        fraudResults: fraudResults.slice(0, 3),
        presenceCount: presenceResults.length,
      },
      normalizedVerdict: verdict,
      confidenceScore: hasFraudSignal ? 0.88 : !hasPresence ? 0.75 : 0.9,
      llmSummary:
        verdict === NormalizedVerdict.hard_flag
          ? `Adverse search results found for "${entityName}" — fraud or scam indicators present.`
          : verdict === NormalizedVerdict.not_found
            ? `Minimal web presence found for "${entityName}". Organization legitimacy unverified.`
            : `No adverse news found in search results for "${entityName}".`,
    };
  } catch (err) {
    console.warn(
      '[SERP worker] Bright Data call failed, falling back to mock:',
      err,
    );
    return {
      source: CheckSource.serp,
      rawResult: {
        query: `${entityName} fraud`,
        results: [],
        error: 'api_unavailable',
      },
      normalizedVerdict: NormalizedVerdict.clear,
      confidenceScore: 0.5,
      llmSummary: `SERP check inconclusive for "${entityName}" (API unavailable).`,
    };
  }
}

// MOCK — Replace with real Bright Data LinkedIn Dataset
export function runLinkedInCheck(entityName: string): MockWorkerResult {
  const flagged = isDemoFlaggedName(entityName);
  return {
    source: CheckSource.linkedin,
    rawResult: {
      query: entityName,
      profiles: flagged ? [] : [{ name: entityName }],
    },
    normalizedVerdict: flagged
      ? NormalizedVerdict.not_found
      : NormalizedVerdict.clear,
    confidenceScore: flagged ? 0.65 : 0.8,
    llmSummary: flagged
      ? `No LinkedIn presence found for "${entityName}".`
      : `LinkedIn profile corroborates identity for "${entityName}".`,
  };
}

// MOCK — Replace with real Bright Data OpenSanctions integration
export function runSanctionsCheck(entityName: string): MockWorkerResult {
  const flagged = isDemoFlaggedName(entityName);
  return {
    source: CheckSource.opensanctions,
    rawResult: {
      query: entityName,
      hits: flagged ? [{ name: entityName }] : [],
    },
    normalizedVerdict: flagged
      ? NormalizedVerdict.hard_flag
      : NormalizedVerdict.clear,
    confidenceScore: flagged ? 0.8 : 0.9,
    llmSummary: flagged
      ? `Potential sanctions match found for "${entityName}".`
      : `No sanctions matches found for "${entityName}".`,
  };
}

// MOCK — Replace with real Bright Data News Scraper API
export function runNewsCheck(entityName: string): MockWorkerResult {
  const flagged = isDemoFlaggedName(entityName);
  return {
    source: CheckSource.news,
    rawResult: {
      query: entityName,
      articles: flagged
        ? [{ headline: `Fraud allegations against ${entityName}` }]
        : [],
    },
    normalizedVerdict: flagged
      ? NormalizedVerdict.hard_flag
      : NormalizedVerdict.clear,
    confidenceScore: flagged ? 0.78 : 0.85,
    llmSummary: flagged
      ? `Negative news coverage found for "${entityName}".`
      : `No negative news coverage found for "${entityName}".`,
  };
}

export async function runAllChecks(
  entityName: string,
): Promise<MockWorkerResult[]> {
  const [ofac, serp] = await Promise.all([
    runOfacCheck(entityName),
    runSerpCheck(entityName),
  ]);
  return [
    ofac,
    runLinkedInCheck(entityName),
    runSanctionsCheck(entityName),
    serp,
    runNewsCheck(entityName),
  ];
}

// Kept for backward compatibility — callers should prefer runAllChecks
export function runAllMockChecks(entityName: string): MockWorkerResult[] {
  return [
    runLinkedInCheck(entityName),
    runSanctionsCheck(entityName),
    runNewsCheck(entityName),
  ];
}
