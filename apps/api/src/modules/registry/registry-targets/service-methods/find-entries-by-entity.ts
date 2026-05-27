import { RegistryTargetsRepository } from '../registry-targets.repository';
import { RegistryEntry } from '../../registry-entries/entities/registry-entry.entity';
import { EntityLookupFilters } from '../entities/registry-target.entity';

export async function findEntriesByEntity(
  repository: RegistryTargetsRepository,
  filters: EntityLookupFilters,
): Promise<RegistryEntry[]> {
  return repository.findEntriesByEntity(filters);
}
