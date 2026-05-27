import { EntityAliasesRepository } from '../entity-aliases.repository';
import { AuditLogsService } from '../../../compliance/audit-logs/audit-logs.service';
import { AuditActorType } from '../../../../generated/client';
import { EntityAlias } from '../entities/entity-alias.entity';

export async function updateAliasConfidenceMethod(
  repository: EntityAliasesRepository,
  auditLogsService: AuditLogsService,
  id: string,
  confidence: number,
): Promise<EntityAlias> {
  const old = await repository.findById(id);
  if (!old) {
    throw new Error(`Entity alias not found: ${id}`);
  }

  const updated = await repository.updateConfidence(id, confidence);

  await auditLogsService.logAction({
    actorType: AuditActorType.system,
    actorId: 'system',
    action: 'entity_alias_confidence_updated',
    targetType: 'entity_alias',
    targetId: id,
    oldValue: { confidence: old.confidence },
    newValue: { confidence: updated.confidence },
  });

  return updated;
}
