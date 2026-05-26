import { PrismaService } from '../../../../prisma/prisma.service';
import { EntityAlias } from '../entities/entity-alias.entity';

export function updateAliasConfidence(
  prisma: PrismaService,
  id: string,
  confidence: number,
): Promise<EntityAlias> {
  return prisma.entityAlias.update({
    where: { id },
    data: { confidence },
  });
}
