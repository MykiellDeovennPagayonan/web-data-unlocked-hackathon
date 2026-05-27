import { RegistryEntriesRepository } from '../registry-entries.repository';
import {
  RegistryEntry,
  CreateRegistryEntryData,
} from '../entities/registry-entry.entity';

export async function createEntry(
  repository: RegistryEntriesRepository,
  input: CreateRegistryEntryData,
): Promise<RegistryEntry> {
  return repository.insert(input);
}
