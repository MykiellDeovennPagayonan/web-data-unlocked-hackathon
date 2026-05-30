import { PrismaService } from '../../../../prisma/prisma.service';
import { WebhookLog } from '../entities/webhook-log.entity';

export async function findManyWebhookLogs(
  prisma: PrismaService,
  take = 100,
  skip = 0,
): Promise<WebhookLog[]> {
  return prisma.webhookDeliveryLog.findMany({
    orderBy: { createdAt: 'desc' },
    take,
    skip,
  });
}
