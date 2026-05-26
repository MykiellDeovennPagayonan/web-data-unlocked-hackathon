import { Injectable } from '@nestjs/common';
import { EntityAliasesRepository } from './entity-aliases/entity-aliases.repository';
import { createAlias } from './entity-aliases/service-methods/create-alias';
import { getAliasesByEntity } from './entity-aliases/service-methods/get-aliases-by-entity';
import { resolveCanonicalEntity } from './entity-aliases/service-methods/resolve-canonical-entity';
import { updateAliasConfidenceMethod } from './entity-aliases/service-methods/update-alias-confidence';
import {
  CreateEntityAliasData,
  EntityAlias,
  EntityType,
  AliasType,
} from './entity-aliases/entities/entity-alias.entity';

@Injectable()
export class EntityAliasesService {
  constructor(private readonly repository: EntityAliasesRepository) {}

  createAlias = (input: CreateEntityAliasData): Promise<EntityAlias> =>
    createAlias(this.repository, input);

  getAliasesByEntity = (
    canonicalEntityType: EntityType,
    canonicalEntityId: string,
  ): Promise<EntityAlias[]> =>
    getAliasesByEntity(this.repository, canonicalEntityType, canonicalEntityId);

  resolveCanonicalEntity = (
    aliasType: AliasType,
    aliasValueHash: string,
  ): Promise<EntityAlias | null> =>
    resolveCanonicalEntity(this.repository, aliasType, aliasValueHash);

  updateAliasConfidence = (
    id: string,
    confidence: number,
  ): Promise<EntityAlias> =>
    updateAliasConfidenceMethod(this.repository, id, confidence);
}
