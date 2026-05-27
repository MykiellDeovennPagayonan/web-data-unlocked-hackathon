import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { insertAlias } from './repository-ops/insert-alias';
import { findAliasesByEntity } from './repository-ops/find-aliases-by-entity';
import { findEntityByAlias } from './repository-ops/find-entity-by-alias';
import { findAliasById } from './repository-ops/find-alias-by-id';
import { updateAliasConfidence } from './repository-ops/update-alias-confidence';
import {
  CreateEntityAliasData,
  EntityAlias,
  EntityType,
  AliasType,
} from './entities/entity-alias.entity';

@Injectable()
export class EntityAliasesRepository {
  constructor(private readonly prisma: PrismaService) {}

  insert = (data: CreateEntityAliasData): Promise<EntityAlias> =>
    insertAlias(this.prisma, data);

  findByEntity = (
    canonicalEntityType: EntityType,
    canonicalEntityId: string,
  ): Promise<EntityAlias[]> =>
    findAliasesByEntity(this.prisma, canonicalEntityType, canonicalEntityId);

  findByAlias = (
    aliasType: AliasType,
    aliasValueHash: string,
  ): Promise<EntityAlias | null> =>
    findEntityByAlias(this.prisma, aliasType, aliasValueHash);

  findById = (id: string): Promise<EntityAlias | null> =>
    findAliasById(this.prisma, id);

  updateConfidence = (id: string, confidence: number): Promise<EntityAlias> =>
    updateAliasConfidence(this.prisma, id, confidence);
}
