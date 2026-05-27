import { PlatformRulesRepository } from '../platform-rules.repository';
import { AuditLogsService } from '../../../compliance/audit-logs/audit-logs.service';
import { AuditActorType } from '../../../../generated/client';
import {
  PlatformRule,
  UpdatePlatformRuleData,
} from '../entities/platform-rule.entity';

export async function updatePlatformRule(
  repository: PlatformRulesRepository,
  auditLogsService: AuditLogsService,
  id: string,
  input: UpdatePlatformRuleData,
): Promise<PlatformRule> {
  const old = await repository.findById(id);
  if (!old) {
    throw new Error(`Platform rule not found: ${id}`);
  }

  const updated = await repository.update(id, input);

  await auditLogsService.logAction({
    actorType: AuditActorType.system,
    actorId: 'system',
    action: 'platform_rule_updated',
    targetType: 'platform_rule',
    targetId: id,
    oldValue: {
      ruleTrigger: old.ruleTrigger,
      conditionJson: old.conditionJson,
      action: old.action,
    },
    newValue: {
      ruleTrigger: updated.ruleTrigger,
      conditionJson: updated.conditionJson,
      action: updated.action,
    },
  });

  return updated;
}
