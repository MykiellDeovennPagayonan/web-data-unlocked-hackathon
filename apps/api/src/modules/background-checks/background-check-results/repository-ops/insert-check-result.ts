import { PrismaService } from '../../../../prisma/prisma.service';
import {
  BackgroundCheckResult,
  CreateBackgroundCheckResultData,
} from '../entities/background-check-result.entity';

export async function insertCheckResult(
  prisma: PrismaService,
  data: CreateBackgroundCheckResultData,
): Promise<BackgroundCheckResult> {
  return prisma.backgroundCheckResult.create({
    data: {
      checkId: data.checkId,
      source: data.source,
      rawResult: data.rawResult,
      normalizedVerdict: data.normalizedVerdict,
      confidenceScore: data.confidenceScore,
      llmSummary: data.llmSummary,
    },
  });
}
