import { RuleTrigger } from '../../../../generated/client';
import { PlatformRulesRepository } from '../platform-rules.repository';
import { PlatformRule } from '../entities/platform-rule.entity';

export function findRulesForTrigger(
  repository: PlatformRulesRepository,
  platformId: string,
  ruleTrigger: RuleTrigger,
): Promise<PlatformRule[]> {
  return repository.findForTrigger(platformId, ruleTrigger);
}
