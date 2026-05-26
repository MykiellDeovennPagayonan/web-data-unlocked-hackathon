import { PrismaService } from '../../../../prisma/prisma.service';
import {
  PlatformRule,
  UpdatePlatformRuleData,
} from '../entities/platform-rule.entity';

export function updatePlatformRule(
  prisma: PrismaService,
  id: string,
  data: UpdatePlatformRuleData,
): Promise<PlatformRule> {
  return prisma.platformRule.update({
    where: { id },
    data: {
      ...(data.ruleTrigger && { ruleTrigger: data.ruleTrigger }),
      ...(data.conditionJson && { conditionJson: data.conditionJson }),
      ...(data.action && { action: data.action }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });
}
