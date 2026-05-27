import { RegistryEntriesRepository } from '../registry-entries.repository';
import { RegistryEntry } from '../entities/registry-entry.entity';

export async function getEntryById(
  repository: RegistryEntriesRepository,
  id: string,
): Promise<RegistryEntry | null> {
  return repository.findById(id);
}
