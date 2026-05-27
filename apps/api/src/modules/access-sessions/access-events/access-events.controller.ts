import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../../../common/guards/api-key.guard';
import { AccessEventsService } from './access-events.service';
import { LogAccessEventDto } from './dto/log-access-event.dto';
import { AccessEvent } from './entities/access-event.entity';

@Controller()
export class AccessEventsController {
  constructor(private readonly accessEventsService: AccessEventsService) {}

  @Post('v1/access/events')
  @UseGuards(ApiKeyGuard)
  logAccessEvent(@Body() dto: LogAccessEventDto): Promise<AccessEvent> {
    return this.accessEventsService.recordAccessEvent({
      platformId: dto.platformId,
      identityId: dto.identityId,
      orgId: dto.orgId,
      ipId: dto.ipId,
      deviceId: dto.deviceId,
      eventType: dto.eventType,
      verdict: dto.verdict,
      scoreAtEvent: dto.scoreAtEvent,
      triggeredRules: dto.triggeredRules ?? {},
    });
  }

  @Get('admin/access/events/platform/:platformId')
  getPlatformEvents(
    @Param('platformId') platformId: string,
  ): Promise<AccessEvent[]> {
    return this.accessEventsService.getPlatformEvents(platformId);
  }
}
