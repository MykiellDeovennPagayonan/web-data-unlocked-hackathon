import { WebhooksRepository } from '../webhooks.repository';
import {
  WebhookLog,
  CreateWebhookLogData,
} from '../entities/webhook-log.entity';

export async function queueRetry(
  repository: WebhooksRepository,
  originalLogId: string,
): Promise<WebhookLog> {
  // Get the original log
  const originalLog = await repository.findById(originalLogId);
  if (!originalLog) {
    throw new Error('Original webhook log not found');
  }

  // Create a new attempt log
  const newAttemptData: CreateWebhookLogData = {
    platformId: originalLog.platformId,
    eventType: originalLog.eventType,
    payload: originalLog.payload as object,
    attemptNumber: originalLog.attemptNumber + 1,
  };

  return repository.insert(newAttemptData);
}
