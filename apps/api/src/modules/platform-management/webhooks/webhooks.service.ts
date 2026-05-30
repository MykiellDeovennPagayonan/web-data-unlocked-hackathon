import { Injectable } from '@nestjs/common';
import { WebhooksRepository } from './webhooks.repository';
import { logWebhookAttempt } from './service-methods/log-webhook-attempt';
import { getWebhookLogById } from './service-methods/get-webhook-log-by-id';
import { listWebhookLogs } from './service-methods/list-webhook-logs';
import { listAllWebhookLogs } from './service-methods/list-all-webhook-logs';
import { recordDelivery } from './service-methods/record-delivery';
import { queueRetry } from './service-methods/queue-retry';
import {
  WebhookLog,
  WebhookLogFilters,
  CreateWebhookLogData,
} from './entities/webhook-log.entity';

@Injectable()
export class WebhooksService {
  constructor(private readonly repository: WebhooksRepository) {}

  logWebhookAttempt = (data: CreateWebhookLogData): Promise<WebhookLog> =>
    logWebhookAttempt(this.repository, data);

  getWebhookLogById = (id: string): Promise<WebhookLog | null> =>
    getWebhookLogById(this.repository, id);

  listWebhookLogs = (filters: WebhookLogFilters): Promise<WebhookLog[]> =>
    listWebhookLogs(this.repository, filters);

  listAllWebhookLogs = (take?: number, skip?: number): Promise<WebhookLog[]> =>
    listAllWebhookLogs(this.repository, take, skip);

  recordDelivery = (
    logId: string,
    responseStatus: number,
    responseBody: string,
  ): Promise<WebhookLog> =>
    recordDelivery(this.repository, logId, responseStatus, responseBody);

  queueRetry = (originalLogId: string): Promise<WebhookLog> =>
    queueRetry(this.repository, originalLogId);
}
