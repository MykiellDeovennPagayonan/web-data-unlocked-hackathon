import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiKeyGuard } from '../../../common/guards/api-key.guard';
import { CurrentPlatform } from '../../../common/decorators/current-platform.decorator';
import { WebhooksService } from './webhooks.service';
import { RetryWebhookDto } from './dto/retry-webhook.dto';
import { WebhookLog } from './entities/webhook-log.entity';

@Controller('v1/platform/webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get('logs')
  @UseGuards(ApiKeyGuard)
  listWebhookLogs(
    @CurrentPlatform() platformId: string,
    @Query('status') status?: 'delivered' | 'failed',
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<WebhookLog[]> {
    return this.webhooksService.listWebhookLogs({
      platformId,
      status,
      limit,
      offset,
    });
  }

  @Get('logs/:id')
  getWebhookLogById(@Param('id') id: string): Promise<WebhookLog | null> {
    return this.webhooksService.getWebhookLogById(id);
  }

  @Post('logs/:id/retry')
  retryWebhook(
    @Param('id') id: string,
    @Body() dto: RetryWebhookDto,
  ): Promise<WebhookLog> {
    void dto;
    return this.webhooksService.queueRetry(id);
  }
}
