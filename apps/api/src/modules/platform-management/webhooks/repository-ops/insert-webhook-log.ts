import { PrismaService } from '../../../../prisma/prisma.service';
import {
  WebhookLog,
  CreateWebhookLogData,
} from '../entities/webhook-log.entity';

export function insertWebhookLog(
  prisma: PrismaService,
  data: CreateWebhookLogData,
): Promise<WebhookLog> {
  return prisma.webhookDeliveryLog.create({
    data: {
      platformId: data.platformId,
      eventType: data.eventType,
      payload: data.payload,
      attemptNumber: data.attemptNumber,
      responseStatus: 0,
    },
  });
}
