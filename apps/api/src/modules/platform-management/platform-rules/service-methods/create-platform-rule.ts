import { PlatformRulesRepository } from '../platform-rules.repository';
import { AuditLogsService } from '../../../compliance/audit-logs/audit-logs.service';
import { AuditActorType } from '../../../../generated/client';
import {
  PlatformRule,
  CreatePlatformRuleData,
} from '../entities/platform-rule.entity';

export async function createPlatformRule(
  repository: PlatformRulesRepository,
  auditLogsService: AuditLogsService,
  input: CreatePlatformRuleData,
): Promise<PlatformRule> {
  const rule = await repository.insert(input);

  await auditLogsService.logAction({
    actorType: AuditActorType.system,
    actorId: 'system',
    action: 'platform_rule_created',
    targetType: 'platform_rule',
    targetId: rule.id,
    newValue: {
      platformId: rule.platformId,
      ruleTrigger: rule.ruleTrigger,
      action: rule.action,
    },
  });

  return rule;
}
