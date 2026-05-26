import { PrismaService } from '../../../../prisma/prisma.service';
import { EntityAlias, AliasType } from '../entities/entity-alias.entity';

export function findEntityByAlias(
  prisma: PrismaService,
  aliasType: AliasType,
  aliasValueHash: string,
): Promise<EntityAlias | null> {
  return prisma.entityAlias.findFirst({
    where: { aliasType, aliasValueHash },
    orderBy: { confidence: 'desc' },
  });
}
