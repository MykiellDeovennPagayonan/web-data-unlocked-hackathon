import { Injectable } from '@nestjs/common';
import { CommunityReportsRepository } from './community-reports.repository';
import { RegistryEntriesRepository } from '../registry-entries/registry-entries.repository';
import { RegistryTargetsRepository } from '../registry-targets/registry-targets.repository';
import { TrustSignalsService } from '../../trust-engine/trust-signals/trust-signals.service';
import { AuditLogsService } from '../../compliance/audit-logs/audit-logs.service';
import { submitReport } from './service-methods/submit-report';
import { getReportById } from './service-methods/get-report-by-id';
import { listReports } from './service-methods/list-reports';
import { updateReportStatus } from './service-methods/update-report-status';
import {
  acceptReport,
  AcceptReportInput,
} from './service-methods/accept-report';
import {
  CommunityReport,
  CreateCommunityReportData,
  UpdateCommunityReportStatusData,
  CommunityReportFilters,
} from './entities/community-report.entity';

@Injectable()
export class CommunityReportsService {
  constructor(
    private readonly repository: CommunityReportsRepository,
    private readonly entriesRepository: RegistryEntriesRepository,
    private readonly targetsRepository: RegistryTargetsRepository,
    private readonly trustSignalsService: TrustSignalsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  submitReport = (input: CreateCommunityReportData): Promise<CommunityReport> =>
    submitReport(this.repository, input);

  getReportById = (id: string): Promise<CommunityReport | null> =>
    getReportById(this.repository, id);

  listReports = (filters: CommunityReportFilters): Promise<CommunityReport[]> =>
    listReports(this.repository, filters);

  updateReportStatus = (
    id: string,
    input: UpdateCommunityReportStatusData,
  ): Promise<CommunityReport> => updateReportStatus(this.repository, id, input);

  acceptReport = (input: AcceptReportInput): Promise<CommunityReport> =>
    acceptReport(
      this.repository,
      this.entriesRepository,
      this.targetsRepository,
      this.trustSignalsService,
      this.auditLogsService,
      input,
    );
}
