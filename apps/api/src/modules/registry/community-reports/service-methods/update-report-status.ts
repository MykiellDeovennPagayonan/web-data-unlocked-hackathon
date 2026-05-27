import { CommunityReportsRepository } from '../community-reports.repository';
import { AuditLogsService } from '../../../compliance/audit-logs/audit-logs.service';
import { AuditActorType } from '../../../../generated/client';
import {
  CommunityReport,
  UpdateCommunityReportStatusData,
} from '../entities/community-report.entity';

export async function updateReportStatus(
  repository: CommunityReportsRepository,
  auditLogsService: AuditLogsService,
  id: string,
  input: UpdateCommunityReportStatusData,
): Promise<CommunityReport> {
  const old = await repository.findById(id);
  if (!old) {
    throw new Error(`Community report not found: ${id}`);
  }

  const updated = await repository.updateStatus(id, input);

  await auditLogsService.logAction({
    actorType: AuditActorType.system,
    actorId: 'system',
    action: 'community_report_status_updated',
    targetType: 'community_report',
    targetId: id,
    oldValue: { status: old.status },
    newValue: { status: updated.status },
  });

  return updated;
}
