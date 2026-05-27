import { CommunityReportsRepository } from '../community-reports.repository';
import { AuditLogsService } from '../../../compliance/audit-logs/audit-logs.service';
import { AuditActorType } from '../../../../generated/client';
import {
  CommunityReport,
  CreateCommunityReportData,
} from '../entities/community-report.entity';

export async function submitReport(
  repository: CommunityReportsRepository,
  auditLogsService: AuditLogsService,
  input: CreateCommunityReportData,
): Promise<CommunityReport> {
  const report = await repository.insert(input);

  await auditLogsService.logAction({
    actorType: AuditActorType.system,
    actorId: 'system',
    action: 'community_report_submitted',
    targetType: 'community_report',
    targetId: report.id,
    newValue: {
      targetType: report.targetType,
      description: report.description,
      status: report.status,
    },
  });

  return report;
}
