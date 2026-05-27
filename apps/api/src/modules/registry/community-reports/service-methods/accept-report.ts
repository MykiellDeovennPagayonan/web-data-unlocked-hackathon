import { CommunityReportsRepository } from '../community-reports.repository';
import { RegistryEntriesRepository } from '../../registry-entries/registry-entries.repository';
import { RegistryTargetsRepository } from '../../registry-targets/registry-targets.repository';
import { TrustSignalsService } from '../../../trust-engine/trust-signals/trust-signals.service';
import { AuditLogsService } from '../../../compliance/audit-logs/audit-logs.service';
import { CommunityReport } from '../entities/community-report.entity';
import {
  ListType,
  RegistrySeverity,
  RegistrySourceType,
  ReportStatus,
  EntityType,
  SignalType,
  SignalSource,
  AuditActorType,
} from '../../../../generated/client';

export interface AcceptReportInput {
  reportId: string;
  severity?: RegistrySeverity;
}

export async function acceptReport(
  reportsRepo: CommunityReportsRepository,
  entriesRepo: RegistryEntriesRepository,
  targetsRepo: RegistryTargetsRepository,
  trustSignalsService: TrustSignalsService,
  auditLogsService: AuditLogsService,
  input: AcceptReportInput,
): Promise<CommunityReport> {
  const report = await reportsRepo.findById(input.reportId);
  if (!report) {
    throw new Error(`Community report not found: ${input.reportId}`);
  }

  const entry = await entriesRepo.insert({
    listType: ListType.blacklist,
    severity: input.severity ?? RegistrySeverity.yellow_soft,
    sourceType: RegistrySourceType.community_report,
  });

  await targetsRepo.insert({
    registryEntryId: entry.id,
    targetType: report.targetType,
    identityId: report.identityId ?? undefined,
    orgId: report.orgId ?? undefined,
    ipId: report.ipId ?? undefined,
    emailHash: report.emailHash ?? undefined,
  });

  const updated = await reportsRepo.updateStatus(input.reportId, {
    status: ReportStatus.accepted,
    registryEntryId: entry.id,
  });

  const entityType =
    report.targetType === 'organization'
      ? EntityType.organization
      : EntityType.identity;

  if (report.identityId || report.orgId) {
    await trustSignalsService.createTrustSignal({
      entityType,
      identityId: report.identityId ?? undefined,
      orgId: report.orgId ?? undefined,
      signalType: SignalType.community_report,
      weight: -10,
      source: SignalSource.community_report,
      referenceId: updated.id,
    });
  }

  await auditLogsService.logAction({
    actorType: AuditActorType.system,
    actorId: 'system',
    action: 'report_accepted',
    targetType: 'community_report',
    targetId: updated.id,
    oldValue: { status: report.status },
    newValue: { status: ReportStatus.accepted, registryEntryId: entry.id },
  });

  return updated;
}
