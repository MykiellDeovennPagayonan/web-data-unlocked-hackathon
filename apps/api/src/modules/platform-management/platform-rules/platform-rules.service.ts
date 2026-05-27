import { Injectable } from '@nestjs/common';
import { RuleTrigger } from '../../../generated/client';
import { PlatformRulesRepository } from './platform-rules.repository';
import { createPlatformRule } from './service-methods/create-platform-rule';
import { getRuleById } from './service-methods/get-rule-by-id';
import { listRulesByPlatform } from './service-methods/list-rules-by-platform';
import { updatePlatformRule } from './service-methods/update-platform-rule';
import { deletePlatformRule } from './service-methods/delete-platform-rule';
import { toggleRule } from './service-methods/toggle-rule';
import { applyStrictnessPreset } from './service-methods/apply-strictness-preset';
import { findRulesForTrigger } from './service-methods/find-rules-for-trigger';
import {
  PlatformRule,
  PlatformRuleFilters,
  CreatePlatformRuleData,
  UpdatePlatformRuleData,
} from './entities/platform-rule.entity';

@Injectable()
export class PlatformRulesService {
  constructor(private readonly repository: PlatformRulesRepository) {}

  createPlatformRule = (input: CreatePlatformRuleData): Promise<PlatformRule> =>
    createPlatformRule(this.repository, input);

  getRuleById = (id: string): Promise<PlatformRule | null> =>
    getRuleById(this.repository, id);

  listRulesByPlatform = (
    filters: PlatformRuleFilters,
  ): Promise<PlatformRule[]> => listRulesByPlatform(this.repository, filters);

  updatePlatformRule = (
    id: string,
    input: UpdatePlatformRuleData,
  ): Promise<PlatformRule> => updatePlatformRule(this.repository, id, input);

  deletePlatformRule = (id: string): Promise<PlatformRule> =>
    deletePlatformRule(this.repository, id);

  toggleRule = (id: string, isActive: boolean): Promise<PlatformRule> =>
    toggleRule(this.repository, id, isActive);

  applyStrictnessPreset = (
    platformId: string,
    strictnessLevel: 'low' | 'medium' | 'high' | 'custom',
  ): Promise<void> =>
    applyStrictnessPreset(this.repository, platformId, strictnessLevel);

  findRulesForTrigger = (
    platformId: string,
    ruleTrigger: RuleTrigger,
  ): Promise<PlatformRule[]> =>
    findRulesForTrigger(this.repository, platformId, ruleTrigger);
}
