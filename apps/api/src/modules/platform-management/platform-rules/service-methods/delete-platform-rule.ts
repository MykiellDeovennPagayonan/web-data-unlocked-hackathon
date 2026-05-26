import { PlatformRulesRepository } from '../platform-rules.repository';
import { PlatformRule } from '../entities/platform-rule.entity';

export function deletePlatformRule(
  repository: PlatformRulesRepository,
  id: string,
): Promise<PlatformRule> {
  return repository.delete(id);
}
