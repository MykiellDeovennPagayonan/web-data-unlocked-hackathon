import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../../../common/guards/api-key.guard';
import { BehavioralEventsService } from './behavioral-events.service';
import { LogBehavioralEventDto } from './dto/log-behavioral-event.dto';
import { BehavioralEvent } from './entities/behavioral-event.entity';

@Controller()
export class BehavioralEventsController {
  constructor(
    private readonly behavioralEventsService: BehavioralEventsService,
  ) {}

  @Post('v1/access/behavioral')
  @UseGuards(ApiKeyGuard)
  logBehavioralEvent(
    @Body() dto: LogBehavioralEventDto,
  ): Promise<BehavioralEvent> {
    return this.behavioralEventsService.logBehavioralEvent(dto);
  }

  @Get('admin/access/behavioral/session/:sessionId')
  getSessionEvents(
    @Param('sessionId') sessionId: string,
  ): Promise<BehavioralEvent[]> {
    return this.behavioralEventsService.getSessionEvents(sessionId);
  }
}
