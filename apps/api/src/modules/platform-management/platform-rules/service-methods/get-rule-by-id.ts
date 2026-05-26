import { PlatformRulesRepository } from '../platform-rules.repository';
import { PlatformRule } from '../entities/platform-rule.entity';

export function getRuleById(
  repository: PlatformRulesRepository,
  id: string,
): Promise<PlatformRule | null> {
  return repository.findById(id);
}
