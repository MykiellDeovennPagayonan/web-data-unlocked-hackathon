import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { insertWebhookLog } from './repository-ops/insert-webhook-log';
import { findWebhookLogById } from './repository-ops/find-webhook-log-by-id';
import { findWebhookLogsByPlatform } from './repository-ops/find-webhook-logs-by-platform';
import { updateWebhookLog } from './repository-ops/update-webhook-log';
import {
  WebhookLog,
  CreateWebhookLogData,
  UpdateWebhookLogData,
  WebhookLogFilters,
} from './entities/webhook-log.entity';

@Injectable()
export class WebhooksRepository {
  constructor(private readonly prisma: PrismaService) {}

  insert = (data: CreateWebhookLogData): Promise<WebhookLog> =>
    insertWebhookLog(this.prisma, data);

  findById = (id: string): Promise<WebhookLog | null> =>
    findWebhookLogById(this.prisma, id);

  findByPlatform = (filters: WebhookLogFilters): Promise<WebhookLog[]> =>
    findWebhookLogsByPlatform(this.prisma, filters);

  update = (id: string, data: UpdateWebhookLogData): Promise<WebhookLog> =>
    updateWebhookLog(this.prisma, id, data);
}
