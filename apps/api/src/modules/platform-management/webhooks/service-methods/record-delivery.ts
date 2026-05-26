import { WebhooksRepository } from '../webhooks.repository';
import { WebhookLog } from '../entities/webhook-log.entity';

export function recordDelivery(
  repository: WebhooksRepository,
  logId: string,
  responseStatus: number,
  responseBody: string,
): Promise<WebhookLog> {
  return repository.update(logId, {
    responseStatus,
    responseBody,
    deliveredAt: new Date(),
  });
}
