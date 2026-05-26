import { PrismaService } from '../../../../prisma/prisma.service';
import {
  WebhookLog,
  UpdateWebhookLogData,
} from '../entities/webhook-log.entity';

export function updateWebhookLog(
  prisma: PrismaService,
  id: string,
  data: UpdateWebhookLogData,
): Promise<WebhookLog> {
  return prisma.webhookDeliveryLog.update({
    where: { id },
    data: {
      ...(data.responseStatus && { responseStatus: data.responseStatus }),
      ...(data.responseBody && { responseBody: data.responseBody }),
      ...(data.deliveredAt && { deliveredAt: data.deliveredAt }),
    },
  });
}
