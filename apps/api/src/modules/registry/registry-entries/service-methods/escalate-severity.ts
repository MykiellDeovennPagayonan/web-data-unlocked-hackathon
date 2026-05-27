import { RegistryEntriesRepository } from '../registry-entries.repository';
import { RegistryEntry } from '../entities/registry-entry.entity';
import { RegistrySeverity } from '../../../../generated/client';

export async function escalateSeverity(
  repository: RegistryEntriesRepository,
  id: string,
): Promise<RegistryEntry> {
  const entry = await repository.findById(id);
  if (!entry) {
    throw new Error(`Registry entry not found: ${id}`);
  }

  const nextSeverity: Record<RegistrySeverity, RegistrySeverity> = {
    [RegistrySeverity.yellow_soft]: RegistrySeverity.orange_watch,
    [RegistrySeverity.orange_watch]: RegistrySeverity.red_hard,
    [RegistrySeverity.red_hard]: RegistrySeverity.red_hard,
  };

  return repository.update(id, {
    severity: nextSeverity[entry.severity],
  });
}
