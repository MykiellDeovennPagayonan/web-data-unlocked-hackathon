import { RegistryEntriesRepository } from '../registry-entries.repository';
import {
  RegistryEntry,
  RegistryEntryFilters,
} from '../entities/registry-entry.entity';

export async function listEntries(
  repository: RegistryEntriesRepository,
  filters: RegistryEntryFilters,
): Promise<RegistryEntry[]> {
  return repository.list(filters);
}
