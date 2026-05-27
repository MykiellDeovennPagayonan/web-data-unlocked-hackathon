import { PrismaService } from '../../../../prisma/prisma.service';
import { AccessEvent } from '../entities/access-event.entity';

export async function findAccessEventsByPlatform(
  prisma: PrismaService,
  platformId: string,
  take = 50,
): Promise<AccessEvent[]> {
  return prisma.accessEvent.findMany({
    where: { platformId },
    orderBy: { createdAt: 'desc' },
    take,
  });
}
