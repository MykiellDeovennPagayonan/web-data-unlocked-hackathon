import { Injectable } from '@nestjs/common';
import { AuditLogsService } from '../../compliance/audit-logs/audit-logs.service';
import { BackgroundChecksRepository } from './background-checks.repository';
import { BackgroundCheckResultsRepository } from '../background-check-results/background-check-results.repository';
import { TrustSignalsService } from '../../trust-engine/trust-signals/trust-signals.service';
import { createBackgroundCheck } from './service-methods/create-background-check';
import { getBackgroundCheckById } from './service-methods/get-background-check-by-id';
import { listBackgroundChecksByEntity } from './service-methods/list-background-checks-by-entity';
import {
  completeBackgroundCheck,
  CompleteBackgroundCheckInput,
} from './service-methods/complete-background-check';
import {
  BackgroundCheck,
  BackgroundCheckFilters,
  CreateBackgroundCheckData,
} from './entities/background-check.entity';
import { runAllChecks } from '../orchestrator/mock-workers';
import { NormalizedVerdict, CheckVerdict } from '../../../generated/client';

@Injectable()
export class BackgroundChecksService {
  constructor(
    private readonly repository: BackgroundChecksRepository,
    private readonly resultsRepository: BackgroundCheckResultsRepository,
    private readonly trustSignalsService: TrustSignalsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  createBackgroundCheck = (
    input: CreateBackgroundCheckData,
  ): Promise<BackgroundCheck> =>
    createBackgroundCheck(this.repository, this.auditLogsService, input);

  getBackgroundCheckById = (id: string): Promise<BackgroundCheck | null> =>
    getBackgroundCheckById(this.repository, id);

  listBackgroundChecksByEntity = (
    filters: BackgroundCheckFilters,
  ): Promise<BackgroundCheck[]> =>
    listBackgroundChecksByEntity(this.repository, filters);

  completeBackgroundCheck = (
    input: CompleteBackgroundCheckInput,
  ): Promise<BackgroundCheck> =>
    completeBackgroundCheck(
      this.repository,
      this.trustSignalsService,
      this.auditLogsService,
      input,
    );

  async runBackgroundCheck(
    input: CreateBackgroundCheckData & { entityName?: string },
  ): Promise<BackgroundCheck> {
    const check = await createBackgroundCheck(
      this.repository,
      this.auditLogsService,
      input,
    );

    const name =
      input.entityName ?? check.identityId ?? check.orgId ?? 'unknown';
    const workerResults = await runAllChecks(name);

    await Promise.all(
      workerResults.map((r) =>
        this.resultsRepository.insert({
          checkId: check.id,
          source: r.source,
          rawResult: r.rawResult,
          normalizedVerdict: r.normalizedVerdict,
          confidenceScore: r.confidenceScore,
          llmSummary: r.llmSummary,
        }),
      ),
    );

    const hasBlocked = workerResults.some(
      (r) => r.normalizedVerdict === NormalizedVerdict.hard_flag,
    );
    const hasNotFound = workerResults.some(
      (r) => r.normalizedVerdict === NormalizedVerdict.not_found,
    );
    const hasSoftFlag = workerResults.some(
      (r) => r.normalizedVerdict === NormalizedVerdict.soft_flag,
    );

    const overallVerdict: CheckVerdict = hasBlocked
      ? CheckVerdict.blocked
      : hasNotFound
        ? CheckVerdict.flagged
        : hasSoftFlag
          ? CheckVerdict.flagged
          : CheckVerdict.clean;

    return completeBackgroundCheck(
      this.repository,
      this.trustSignalsService,
      this.auditLogsService,
      { checkId: check.id, overallVerdict },
    );
  }
}
