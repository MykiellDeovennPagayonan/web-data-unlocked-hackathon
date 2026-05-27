import { VerificationRequestsRepository } from '../verification-requests.repository';
import { TrustSignalsService } from '../../../trust-engine/trust-signals/trust-signals.service';
import { AuditLogsService } from '../../audit-logs/audit-logs.service';
import { VerificationRequest } from '../entities/verification-request.entity';
import {
  VerificationStatus,
  EntityType,
  SignalType,
  SignalSource,
  AuditActorType,
} from '../../../../generated/client';

export async function rejectVerification(
  repository: VerificationRequestsRepository,
  trustSignalsService: TrustSignalsService,
  auditLogsService: AuditLogsService,
  id: string,
  rejectionReason?: string,
): Promise<VerificationRequest> {
  const request = await repository.findById(id);
  if (!request) {
    throw new Error(`Verification request not found: ${id}`);
  }

  const updated = await repository.updateStatus(id, {
    status: VerificationStatus.rejected,
    decidedAt: new Date(),
    rejectionReason,
  });

  await trustSignalsService.createTrustSignal({
    entityType: EntityType.identity,
    identityId: request.identityId,
    signalType: SignalType.behavioral_flag,
    weight: -5,
    source: SignalSource.manual,
    referenceId: updated.id,
  });

  await auditLogsService.logAction({
    actorType: AuditActorType.system,
    actorId: 'system',
    action: 'verification_rejected',
    targetType: 'verification_request',
    targetId: updated.id,
    newValue: { status: VerificationStatus.rejected, rejectionReason },
  });

  return updated;
}
