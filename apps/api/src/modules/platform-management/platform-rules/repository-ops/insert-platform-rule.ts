import { PrismaService } from '../../../../prisma/prisma.service';
import {
  PlatformRule,
  CreatePlatformRuleData,
} from '../entities/platform-rule.entity';

export function insertPlatformRule(
  prisma: PrismaService,
  data: CreatePlatformRuleData,
): Promise<PlatformRule> {
  return prisma.platformRule.create({
    data: {
      platformId: data.platformId,
      ruleTrigger: data.ruleTrigger,
      conditionJson: data.conditionJson,
      action: data.action,
      isActive: true,
    },
  });
}
