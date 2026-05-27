import { TrustSignalsRepository } from '../trust-signals.repository';
import {
  TrustSignal,
  TrustSignalFilters,
} from '../entities/trust-signal.entity';

export async function getSignalsByEntity(
  repository: TrustSignalsRepository,
  filters: TrustSignalFilters,
): Promise<TrustSignal[]> {
  return repository.findByEntity(filters);
}
