import { PlatformRulesRepository } from '../platform-rules.repository';
import {
  PlatformRule,
  PlatformRuleFilters,
} from '../entities/platform-rule.entity';

export function listRulesByPlatform(
  repository: PlatformRulesRepository,
  filters: PlatformRuleFilters,
): Promise<PlatformRule[]> {
  return repository.findByPlatform(filters);
}
