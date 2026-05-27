import { TrustSignalsRepository } from '../trust-signals.repository';
import {
  TrustSignal,
  CreateTrustSignalData,
} from '../entities/trust-signal.entity';

export async function createTrustSignal(
  repository: TrustSignalsRepository,
  input: CreateTrustSignalData,
): Promise<TrustSignal> {
  return repository.insert(input);
}
