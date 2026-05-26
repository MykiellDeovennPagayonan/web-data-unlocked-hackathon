import { EntityAliasesRepository } from '../entity-aliases.repository';
import { EntityAlias, EntityType } from '../entities/entity-alias.entity';

export function getAliasesByEntity(
  repository: EntityAliasesRepository,
  canonicalEntityType: EntityType,
  canonicalEntityId: string,
): Promise<EntityAlias[]> {
  return repository.findByEntity(canonicalEntityType, canonicalEntityId);
}
