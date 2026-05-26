import { PrismaService } from '../../../../prisma/prisma.service';
import { WebhookLog, WebhookLogFilters } from '../entities/webhook-log.entity';

export function findWebhookLogsByPlatform(
  prisma: PrismaService,
  filters: WebhookLogFilters,
): Promise<WebhookLog[]> {
  return prisma.webhookDeliveryLog.findMany({
    where: {
      platformId: filters.platformId,
      ...(filters.status === 'delivered' && { deliveredAt: { not: null } }),
      ...(filters.status === 'failed' && { deliveredAt: null }),
    },
    orderBy: { createdAt: 'desc' },
    take: filters.limit ?? 50,
    skip: filters.offset ?? 0,
  });
}
