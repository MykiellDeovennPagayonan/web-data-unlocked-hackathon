import { WebhooksRepository } from '../webhooks.repository';
import { WebhookLog } from '../entities/webhook-log.entity';

export async function listAllWebhookLogs(
  repository: WebhooksRepository,
  take?: number,
  skip?: number,
): Promise<WebhookLog[]> {
  return repository.findAll(take, skip);
}
