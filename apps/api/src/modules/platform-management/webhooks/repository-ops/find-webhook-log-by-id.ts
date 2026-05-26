import { PrismaService } from '../../../../prisma/prisma.service';
import { WebhookLog } from '../entities/webhook-log.entity';

export function findWebhookLogById(
  prisma: PrismaService,
  id: string,
): Promise<WebhookLog | null> {
  return prisma.webhookDeliveryLog.findUnique({
    where: { id },
  });
}
