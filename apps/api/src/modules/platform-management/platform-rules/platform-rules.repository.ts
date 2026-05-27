import { Injectable } from '@nestjs/common';
import { RuleTrigger } from '../../../generated/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { insertPlatformRule } from './repository-ops/insert-platform-rule';
import { findRuleById } from './repository-ops/find-rule-by-id';
import { findRulesByPlatform } from './repository-ops/find-rules-by-platform';
import { findRulesForTrigger } from './repository-ops/find-rules-for-trigger';
import { updatePlatformRule } from './repository-ops/update-platform-rule';
import { deletePlatformRule } from './repository-ops/delete-platform-rule';
import {
  PlatformRule,
  PlatformRuleFilters,
  CreatePlatformRuleData,
  UpdatePlatformRuleData,
} from './entities/platform-rule.entity';

@Injectable()
export class PlatformRulesRepository {
  constructor(private readonly prisma: PrismaService) {}

  insert = (data: CreatePlatformRuleData): Promise<PlatformRule> =>
    insertPlatformRule(this.prisma, data);

  findById = (id: string): Promise<PlatformRule | null> =>
    findRuleById(this.prisma, id);

  findByPlatform = (filters: PlatformRuleFilters): Promise<PlatformRule[]> =>
    findRulesByPlatform(this.prisma, filters);

  findForTrigger = (
    platformId: string,
    ruleTrigger: RuleTrigger,
  ): Promise<PlatformRule[]> =>
    findRulesForTrigger(this.prisma, platformId, ruleTrigger);

  update = (id: string, data: UpdatePlatformRuleData): Promise<PlatformRule> =>
    updatePlatformRule(this.prisma, id, data);

  delete = (id: string): Promise<PlatformRule> =>
    deletePlatformRule(this.prisma, id);
}
