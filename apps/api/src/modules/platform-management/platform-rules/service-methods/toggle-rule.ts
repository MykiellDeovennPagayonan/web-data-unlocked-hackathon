import { PlatformRulesRepository } from '../platform-rules.repository';
import { PlatformRule } from '../entities/platform-rule.entity';

export function toggleRule(
  repository: PlatformRulesRepository,
  id: string,
  isActive: boolean,
): Promise<PlatformRule> {
  return repository.update(id, { isActive });
}
