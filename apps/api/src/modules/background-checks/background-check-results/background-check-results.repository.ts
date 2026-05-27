import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { insertCheckResult } from './repository-ops/insert-check-result';
import { findResultsByCheckId } from './repository-ops/find-results-by-check-id';
import {
  BackgroundCheckResult,
  CreateBackgroundCheckResultData,
} from './entities/background-check-result.entity';

@Injectable()
export class BackgroundCheckResultsRepository {
  constructor(private readonly prisma: PrismaService) {}

  insert = (
    data: CreateBackgroundCheckResultData,
  ): Promise<BackgroundCheckResult> => insertCheckResult(this.prisma, data);

  findByCheckId = (checkId: string): Promise<BackgroundCheckResult[]> =>
    findResultsByCheckId(this.prisma, checkId);
}
