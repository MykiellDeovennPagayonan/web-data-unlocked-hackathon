import { PlatformRulesRepository } from '../platform-rules.repository';
import {
  PlatformRule,
  CreatePlatformRuleData,
} from '../entities/platform-rule.entity';

export function createPlatformRule(
  repository: PlatformRulesRepository,
  input: CreatePlatformRuleData,
): Promise<PlatformRule> {
  return repository.insert(input);
}
