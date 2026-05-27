import { BackgroundChecksRepository } from '../background-checks.repository';
import { AuditLogsService } from '../../../compliance/audit-logs/audit-logs.service';
import { BackgroundCheck } from '../entities/background-check.entity';
import { TrustSignalsService } from '../../../trust-engine/trust-signals/trust-signals.service';
import {
  CheckVerdict,
  SignalType,
  SignalSource,
  AuditActorType,
} from '../../../../generated/client';

export interface CompleteBackgroundCheckInput {
  checkId: string;
  overallVerdict: CheckVerdict;
}

export async function completeBackgroundCheck(
  repository: BackgroundChecksRepository,
  trustSignalsService: TrustSignalsService,
  auditLogsService: AuditLogsService,
  input: CompleteBackgroundCheckInput,
): Promise<BackgroundCheck> {
  const old = await repository.findById(input.checkId);
  if (!old) {
    throw new Error(`Background check not found: ${input.checkId}`);
  }

  const check = await repository.update(input.checkId, {
    overallVerdict: input.overallVerdict,
    completedAt: new Date(),
  });

  // Auto-create trust signal based on verdict
  const weight =
    input.overallVerdict === CheckVerdict.clean
      ? 10
      : input.overallVerdict === CheckVerdict.blocked
        ? -15
        : -5;

  const signalType =
    input.overallVerdict === CheckVerdict.clean
      ? SignalType.clean_history
      : SignalType.behavioral_flag;

  await trustSignalsService.createTrustSignal({
    entityType: check.entityType,
    identityId: check.identityId ?? undefined,
    orgId: check.orgId ?? undefined,
    signalType,
    weight,
    source: SignalSource.background_check,
    referenceId: check.id,
  });

  await auditLogsService.logAction({
    actorType: AuditActorType.system,
    actorId: 'system',
    action: 'background_check_completed',
    targetType: 'background_check',
    targetId: input.checkId,
    oldValue: {
      overallVerdict: old.overallVerdict,
      completedAt: old.completedAt,
    },
    newValue: {
      overallVerdict: check.overallVerdict,
      completedAt: check.completedAt,
    },
  });

  return check;
}
