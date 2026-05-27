import {
  BackgroundCheckResult as PrismaBackgroundCheckResult,
  CheckSource,
  NormalizedVerdict,
} from '../../../../generated/client';

export type BackgroundCheckResult = PrismaBackgroundCheckResult;

export interface CreateBackgroundCheckResultData {
  checkId: string;
  source: CheckSource;
  rawResult: object;
  normalizedVerdict: NormalizedVerdict;
  confidenceScore: number;
  llmSummary: string;
}
