import { PlatformRulesRepository } from '../platform-rules.repository';
import { AuditLogsService } from '../../../compliance/audit-logs/audit-logs.service';
import { AuditActorType } from '../../../../generated/client';
import { PlatformRule } from '../entities/platform-rule.entity';

export async function deletePlatformRule(
  repository: PlatformRulesRepository,
  auditLogsService: AuditLogsService,
  id: string,
): Promise<PlatformRule> {
  const old = await repository.findById(id);
  if (!old) {
    throw new Error(`Platform rule not found: ${id}`);
  }

  const deleted = await repository.delete(id);

  await auditLogsService.logAction({
    actorType: AuditActorType.system,
    actorId: 'system',
    action: 'platform_rule_deleted',
    targetType: 'platform_rule',
    targetId: id,
    oldValue: {
      ruleTrigger: old.ruleTrigger,
      conditionJson: old.conditionJson,
      action: old.action,
      isActive: old.isActive,
    },
    newValue: { deleted: true },
  });

  return deleted;
}
