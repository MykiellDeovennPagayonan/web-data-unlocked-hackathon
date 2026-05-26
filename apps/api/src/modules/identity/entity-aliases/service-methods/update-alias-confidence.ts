import { EntityAliasesRepository } from '../entity-aliases.repository';
import { EntityAlias } from '../entities/entity-alias.entity';

export function updateAliasConfidenceMethod(
  repository: EntityAliasesRepository,
  id: string,
  confidence: number,
): Promise<EntityAlias> {
  return repository.updateConfidence(id, confidence);
}
