import { EntityAliasesRepository } from '../entity-aliases.repository';
import {
  CreateEntityAliasData,
  EntityAlias,
} from '../entities/entity-alias.entity';

export function createAlias(
  repository: EntityAliasesRepository,
  input: CreateEntityAliasData,
): Promise<EntityAlias> {
  return repository.insert(input);
}
