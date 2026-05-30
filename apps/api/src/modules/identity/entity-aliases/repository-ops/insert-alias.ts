import { PrismaService } from '../../../../prisma/prisma.service';
import {
  CreateEntityAliasData,
  EntityAlias,
} from '../entities/entity-alias.entity';

export function insertAlias(
  prisma: PrismaService,
  data: CreateEntityAliasData,
): Promise<EntityAlias> {
  return prisma.entityAlias.create({
    data: {
      canonicalEntityType: data.canonicalEntityType,
      canonicalEntityId: data.canonicalEntityId,
      aliasType: data.aliasType,
      aliasValueHash: data.aliasValueHash,
      aliasValueEncrypted: data.aliasValueEncrypted,
      confidence: data.confidence,
      source: data.source,
      identityId: data.identityId,
      orgId: data.orgId,
    },
  });
}
