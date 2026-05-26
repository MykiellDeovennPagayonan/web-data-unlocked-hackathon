import { PrismaService } from '../../../../prisma/prisma.service';
import { EntityAlias, EntityType } from '../entities/entity-alias.entity';

export function findAliasesByEntity(
  prisma: PrismaService,
  canonicalEntityType: EntityType,
  canonicalEntityId: string,
): Promise<EntityAlias[]> {
  return prisma.entityAlias.findMany({
    where: { canonicalEntityType, canonicalEntityId },
  });
}
