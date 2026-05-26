import { WebhooksRepository } from '../webhooks.repository';
import {
  WebhookLog,
  CreateWebhookLogData,
} from '../entities/webhook-log.entity';

export function logWebhookAttempt(
  repository: WebhooksRepository,
  data: CreateWebhookLogData,
): Promise<WebhookLog> {
  return repository.insert(data);
}
