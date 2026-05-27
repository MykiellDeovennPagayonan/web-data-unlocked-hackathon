import { RegistryTargetsRepository } from '../registry-targets.repository';
import {
  RegistryTarget,
  CreateRegistryTargetData,
} from '../entities/registry-target.entity';

export async function createTarget(
  repository: RegistryTargetsRepository,
  input: CreateRegistryTargetData,
): Promise<RegistryTarget> {
  return repository.insert(input);
}
