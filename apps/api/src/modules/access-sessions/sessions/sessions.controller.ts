import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiKeyGuard } from '../../../common/guards/api-key.guard';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { EndSessionDto } from './dto/end-session.dto';
import { Session } from './entities/session.entity';

@Controller()
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('v1/access/sessions')
  @UseGuards(ApiKeyGuard)
  createSession(@Body() dto: CreateSessionDto): Promise<Session> {
    return this.sessionsService.createSession(dto);
  }

  @Patch('v1/access/sessions/:id/end')
  @UseGuards(ApiKeyGuard)
  endSession(
    @Param('id') id: string,
    @Body() dto: EndSessionDto,
  ): Promise<Session> {
    return this.sessionsService.endSession(
      id,
      dto.riskScoreAtEnd,
      dto.verdict,
      dto.terminationReason,
    );
  }

  @Get('admin/access/sessions/:id')
  getSession(@Param('id') id: string): Promise<Session | null> {
    return this.sessionsService.getSession(id);
  }
}
