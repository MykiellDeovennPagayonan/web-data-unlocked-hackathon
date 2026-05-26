import { WebhooksRepository } from '../webhooks.repository';
import { WebhookLog, WebhookLogFilters } from '../entities/webhook-log.entity';

export function listWebhookLogs(
  repository: WebhooksRepository,
  filters: WebhookLogFilters,
): Promise<WebhookLog[]> {
  return repository.findByPlatform(filters);
}
