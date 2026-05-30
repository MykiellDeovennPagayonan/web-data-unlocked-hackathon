import { PrismaService } from '../../../../prisma/prisma.service';
import { Identity } from '../entities/identity.entity';

export async function findManyIdentities(
  prisma: PrismaService,
  take = 100,
  skip = 0,
): Promise<Identity[]> {
  return prisma.identity.findMany({
    orderBy: { createdAt: 'desc' },
    take,
    skip,
  });
}
