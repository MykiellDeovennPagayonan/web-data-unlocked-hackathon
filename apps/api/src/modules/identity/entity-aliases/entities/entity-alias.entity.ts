import {
  EntityAlias as PrismaEntityAlias,
  EntityType as PrismaEntityType,
  AliasType as PrismaAliasType,
  AliasSource as PrismaAliasSource,
} from '../../../../../generated/prisma/client';

export type EntityAlias = PrismaEntityAlias;
export type EntityType = PrismaEntityType;
export type AliasType = PrismaAliasType;
export type AliasSource = PrismaAliasSource;

export interface CreateEntityAliasData {
  canonicalEntityType: EntityType;
  canonicalEntityId: string;
  aliasType: AliasType;
  aliasValueHash: string;
  aliasValueEncrypted: string;
  confidence: number;
  source: AliasSource;
}

export interface UpdateAliasConfidenceData {
  confidence: number;
}
