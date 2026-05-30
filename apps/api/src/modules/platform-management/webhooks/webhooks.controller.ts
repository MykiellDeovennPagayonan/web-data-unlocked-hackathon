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

@Controller()
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get('admin/webhooks/logs')
  listAdminWebhookLogs(
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ): Promise<WebhookLog[]> {
    const parsedTake = take ? parseInt(take, 10) : undefined;
    const parsedSkip = skip ? parseInt(skip, 10) : undefined;
    return this.webhooksService.listAllWebhookLogs(
      Number.isFinite(parsedTake) ? parsedTake : undefined,
      Number.isFinite(parsedSkip) ? parsedSkip : undefined,
    );
  }

  @Get('v1/platform/webhooks/logs')
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

  @Get('v1/platform/webhooks/logs/:id')
  getWebhookLogById(@Param('id') id: string): Promise<WebhookLog | null> {
    return this.webhooksService.getWebhookLogById(id);
  }

  @Post('v1/platform/webhooks/logs/:id/retry')
  retryWebhook(
    @Param('id') id: string,
    @Body() dto: RetryWebhookDto,
  ): Promise<WebhookLog> {
    void dto;
    return this.webhooksService.queueRetry(id);
  }
}
