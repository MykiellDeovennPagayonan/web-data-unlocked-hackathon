import { EntityAliasesRepository } from '../entity-aliases.repository';
import { EntityAlias, AliasType } from '../entities/entity-alias.entity';

export function resolveCanonicalEntity(
  repository: EntityAliasesRepository,
  aliasType: AliasType,
  aliasValueHash: string,
): Promise<EntityAlias | null> {
  return repository.findByAlias(aliasType, aliasValueHash);
}
