import { WebhooksRepository } from '../webhooks.repository';
import { WebhookLog } from '../entities/webhook-log.entity';

export function getWebhookLogById(
  repository: WebhooksRepository,
  id: string,
): Promise<WebhookLog | null> {
  return repository.findById(id);
}
