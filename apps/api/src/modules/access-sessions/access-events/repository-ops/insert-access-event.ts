import { PrismaService } from '../../../../prisma/prisma.service';
import {
  AccessEvent,
  CreateAccessEventData,
} from '../entities/access-event.entity';

export async function insertAccessEvent(
  prisma: PrismaService,
  data: CreateAccessEventData,
): Promise<AccessEvent> {
  return prisma.accessEvent.create({
    data: {
      platformId: data.platformId,
      identityId: data.identityId ?? null,
      orgId: data.orgId ?? null,
      ipId: data.ipId,
      deviceId: data.deviceId,
      eventType: data.eventType,
      verdict: data.verdict,
      scoreAtEvent: data.scoreAtEvent,
      triggeredRules: data.triggeredRules,
    },
  });
}
