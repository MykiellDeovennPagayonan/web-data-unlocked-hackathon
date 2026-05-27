import { BackgroundChecksRepository } from '../background-checks.repository';
import { BackgroundCheck } from '../entities/background-check.entity';
import { TrustSignalsService } from '../../../trust-engine/trust-signals/trust-signals.service';
import {
  CheckVerdict,
  SignalType,
  SignalSource,
} from '../../../../generated/client';

export interface CompleteBackgroundCheckInput {
  checkId: string;
  overallVerdict: CheckVerdict;
}

export async function completeBackgroundCheck(
  repository: BackgroundChecksRepository,
  trustSignalsService: TrustSignalsService,
  input: CompleteBackgroundCheckInput,
): Promise<BackgroundCheck> {
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

  return check;
}
