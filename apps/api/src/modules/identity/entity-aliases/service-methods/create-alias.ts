import { EntityAliasesRepository } from '../entity-aliases.repository';
import { AuditLogsService } from '../../../compliance/audit-logs/audit-logs.service';
import { AuditActorType } from '../../../../generated/client';
import {
  CreateEntityAliasData,
  EntityAlias,
} from '../entities/entity-alias.entity';

export async function createAlias(
  repository: EntityAliasesRepository,
  auditLogsService: AuditLogsService,
  input: CreateEntityAliasData,
): Promise<EntityAlias> {
  const alias = await repository.insert(input);

  await auditLogsService.logAction({
    actorType: AuditActorType.system,
    actorId: 'system',
    action: 'entity_alias_created',
    targetType: 'entity_alias',
    targetId: alias.id,
    newValue: {
      canonicalEntityType: alias.canonicalEntityType,
      aliasType: alias.aliasType,
      confidence: alias.confidence,
    },
  });

  return alias;
}
