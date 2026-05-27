import { PrismaService } from '../../../../prisma/prisma.service';
import {
  BehavioralEvent,
  CreateBehavioralEventData,
} from '../entities/behavioral-event.entity';

export async function insertBehavioralEvent(
  prisma: PrismaService,
  data: CreateBehavioralEventData,
): Promise<BehavioralEvent> {
  return prisma.behavioralEvent.create({
    data: {
      sessionId: data.sessionId,
      identityId: data.identityId,
      platformId: data.platformId,
      eventType: data.eventType,
      endpoint: data.endpoint,
      flagTriggered: data.flagTriggered,
      flagType: data.flagType ?? null,
      actionTaken: data.actionTaken,
    },
  });
}
