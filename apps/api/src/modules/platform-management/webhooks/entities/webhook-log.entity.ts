import { WebhookDeliveryLog as PrismaWebhookLog } from '../../../../generated/client';

export type WebhookLog = PrismaWebhookLog;

export interface CreateWebhookLogData {
  platformId: string;
  eventType: string;
  payload: object;
  attemptNumber: number;
}

export interface UpdateWebhookLogData {
  responseStatus?: number;
  responseBody?: string;
  deliveredAt?: Date;
}

export interface WebhookLogFilters {
  platformId: string;
  status?: 'delivered' | 'failed';
  limit?: number;
  offset?: number;
}
