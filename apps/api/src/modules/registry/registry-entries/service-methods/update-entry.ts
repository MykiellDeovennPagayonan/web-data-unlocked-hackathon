import { RegistryEntriesRepository } from '../registry-entries.repository';
import {
  RegistryEntry,
  UpdateRegistryEntryData,
} from '../entities/registry-entry.entity';

export async function updateEntry(
  repository: RegistryEntriesRepository,
  id: string,
  input: UpdateRegistryEntryData,
): Promise<RegistryEntry> {
  return repository.update(id, input);
}
