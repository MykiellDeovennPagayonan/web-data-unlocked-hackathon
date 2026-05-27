import { PrismaService } from '../../../../prisma/prisma.service';
import { BehavioralEvent } from '../entities/behavioral-event.entity';

export async function findBehavioralEventsBySession(
  prisma: PrismaService,
  sessionId: string,
): Promise<BehavioralEvent[]> {
  return prisma.behavioralEvent.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'desc' },
  });
}
