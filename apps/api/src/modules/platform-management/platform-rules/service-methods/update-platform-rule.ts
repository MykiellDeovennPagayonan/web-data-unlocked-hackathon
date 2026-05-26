import { PlatformRulesRepository } from '../platform-rules.repository';
import {
  PlatformRule,
  UpdatePlatformRuleData,
} from '../entities/platform-rule.entity';

export function updatePlatformRule(
  repository: PlatformRulesRepository,
  id: string,
  input: UpdatePlatformRuleData,
): Promise<PlatformRule> {
  return repository.update(id, input);
}
