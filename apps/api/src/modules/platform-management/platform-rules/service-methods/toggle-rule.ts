import { PlatformRulesRepository } from '../platform-rules.repository';
import { AuditLogsService } from '../../../compliance/audit-logs/audit-logs.service';
import { AuditActorType } from '../../../../generated/client';
import { PlatformRule } from '../entities/platform-rule.entity';

export async function toggleRule(
  repository: PlatformRulesRepository,
  auditLogsService: AuditLogsService,
  id: string,
  isActive: boolean,
): Promise<PlatformRule> {
  const old = await repository.findById(id);
  if (!old) {
    throw new Error(`Platform rule not found: ${id}`);
  }

  const updated = await repository.update(id, { isActive });

  await auditLogsService.logAction({
    actorType: AuditActorType.system,
    actorId: 'system',
    action: 'platform_rule_toggled',
    targetType: 'platform_rule',
    targetId: id,
    oldValue: { isActive: old.isActive },
    newValue: { isActive: updated.isActive },
  });

  return updated;
}
