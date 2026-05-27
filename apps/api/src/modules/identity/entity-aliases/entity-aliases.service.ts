import { Injectable } from '@nestjs/common';
import { AuditLogsService } from '../../compliance/audit-logs/audit-logs.service';
import { EntityAliasesRepository } from './entity-aliases.repository';
import { createAlias } from './service-methods/create-alias';
import { getAliasesByEntity } from './service-methods/get-aliases-by-entity';
import { resolveCanonicalEntity } from './service-methods/resolve-canonical-entity';
import { updateAliasConfidenceMethod } from './service-methods/update-alias-confidence';
import {
  CreateEntityAliasData,
  EntityAlias,
  EntityType,
  AliasType,
} from './entities/entity-alias.entity';

@Injectable()
export class EntityAliasesService {
  constructor(
    private readonly repository: EntityAliasesRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  createAlias = (input: CreateEntityAliasData): Promise<EntityAlias> =>
    createAlias(this.repository, this.auditLogsService, input);

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
    updateAliasConfidenceMethod(
      this.repository,
      this.auditLogsService,
      id,
      confidence,
    );
}
