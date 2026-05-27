import { PrismaService } from '../../../../prisma/prisma.service';
import { AccessEvent } from '../entities/access-event.entity';

export async function findAccessEventsByIdentity(
  prisma: PrismaService,
  identityId: string,
  take = 50,
): Promise<AccessEvent[]> {
  return prisma.accessEvent.findMany({
    where: { identityId },
    orderBy: { createdAt: 'desc' },
    take,
  });
}
