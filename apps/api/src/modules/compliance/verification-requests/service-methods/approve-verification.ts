import { VerificationRequestsRepository } from '../verification-requests.repository';
import { TrustSignalsService } from '../../../trust-engine/trust-signals/trust-signals.service';
import { TrustScoreSnapshotsService } from '../../../trust-engine/trust-score-snapshots/trust-score-snapshots.service';
import { AuditLogsService } from '../../audit-logs/audit-logs.service';
import { VerificationRequest } from '../entities/verification-request.entity';
import {
  VerificationStatus,
  EntityType,
  SignalType,
  SignalSource,
  SnapshotReason,
  AuditActorType,
} from '../../../../generated/client';

export async function approveVerification(
  repository: VerificationRequestsRepository,
  trustSignalsService: TrustSignalsService,
  trustScoreSnapshotsService: TrustScoreSnapshotsService,
  auditLogsService: AuditLogsService,
  id: string,
): Promise<VerificationRequest> {
  const request = await repository.findById(id);
  if (!request) {
    throw new Error(`Verification request not found: ${id}`);
  }

  const updated = await repository.updateStatus(id, {
    status: VerificationStatus.approved,
    decidedAt: new Date(),
  });

  await trustSignalsService.createTrustSignal({
    entityType: EntityType.identity,
    identityId: request.identityId,
    signalType: SignalType.kyc_passed,
    weight: 15,
    source: SignalSource.manual,
    referenceId: updated.id,
  });

  const score = await trustSignalsService.computeTrustScore(
    EntityType.identity,
    request.identityId,
  );

  await trustScoreSnapshotsService.createSnapshot({
    entityType: EntityType.identity,
    identityId: request.identityId,
    score: score.score,
    snapshotReason: SnapshotReason.certificate_issued,
    referenceId: updated.id,
  });

  await auditLogsService.logAction({
    actorType: AuditActorType.system,
    actorId: 'system',
    action: 'verification_approved',
    targetType: 'verification_request',
    targetId: updated.id,
    newValue: { status: VerificationStatus.approved },
  });

  return updated;
}
