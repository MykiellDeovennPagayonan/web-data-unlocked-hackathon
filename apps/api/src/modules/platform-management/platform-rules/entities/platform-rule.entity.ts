import {
  PlatformRule as PrismaPlatformRule,
  RuleTrigger,
  RuleAction,
} from '../../../../../generated/prisma/client';

export type PlatformRule = PrismaPlatformRule;

export interface CreatePlatformRuleData {
  platformId: string;
  ruleTrigger: RuleTrigger;
  conditionJson: object;
  action: RuleAction;
}

export interface UpdatePlatformRuleData {
  ruleTrigger?: RuleTrigger;
  conditionJson?: object;
  action?: RuleAction;
  isActive?: boolean;
}

export interface PlatformRuleFilters {
  platformId: string;
  ruleTrigger?: RuleTrigger;
  isActive?: boolean;
}
