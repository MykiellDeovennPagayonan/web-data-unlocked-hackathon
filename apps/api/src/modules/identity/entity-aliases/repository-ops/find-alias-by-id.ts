import { PrismaService } from '../../../../prisma/prisma.service';
import { EntityAlias } from '../entities/entity-alias.entity';

export function findAliasById(
  prisma: PrismaService,
  id: string,
): Promise<EntityAlias | null> {
  return prisma.entityAlias.findUnique({
    where: { id },
  });
}
