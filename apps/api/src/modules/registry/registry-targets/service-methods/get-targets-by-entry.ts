import { RegistryTargetsRepository } from '../registry-targets.repository';
import { RegistryTarget } from '../entities/registry-target.entity';

export async function getTargetsByEntry(
  repository: RegistryTargetsRepository,
  registryEntryId: string,
): Promise<RegistryTarget[]> {
  return repository.findByEntryId(registryEntryId);
}
