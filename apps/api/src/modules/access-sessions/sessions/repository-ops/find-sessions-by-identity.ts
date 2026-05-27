import { PrismaService } from '../../../../prisma/prisma.service';
import { Session } from '../entities/session.entity';

export async function findSessionsByIdentity(
  prisma: PrismaService,
  identityId: string,
  take = 20,
): Promise<Session[]> {
  return prisma.session.findMany({
    where: { identityId },
    orderBy: { startedAt: 'desc' },
    take,
  });
}
