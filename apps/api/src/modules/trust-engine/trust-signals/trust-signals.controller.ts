import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiKeyGuard } from '../../../common/guards/api-key.guard';
import { TrustSignalsService } from './trust-signals.service';
import { CreateTrustSignalDto } from './dto/create-trust-signal.dto';
import { TrustSignal } from './entities/trust-signal.entity';
import { ComputedTrustScore } from './service-methods/compute-trust-score';
import {
  EntityType,
  SignalType,
  SignalSource,
} from '../../../generated/client';

@Controller()
export class TrustSignalsController {
  constructor(private readonly trustSignalsService: TrustSignalsService) {}

  @Post('v1/trust-signals')
  @UseGuards(ApiKeyGuard)
  create(@Body() dto: CreateTrustSignalDto): Promise<TrustSignal> {
    return this.trustSignalsService.createTrustSignal({
      entityType: dto.entityType,
      identityId: dto.identityId,
      orgId: dto.orgId,
      signalType: dto.signalType,
      weight: dto.weight,
      source: dto.source,
      referenceId: dto.referenceId,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    });
  }

  @Get('v1/trust-signals')
  @UseGuards(ApiKeyGuard)
  list(
    @Query('entityType') entityType?: EntityType,
    @Query('identityId') identityId?: string,
    @Query('orgId') orgId?: string,
    @Query('signalType') signalType?: SignalType,
    @Query('source') source?: SignalSource,
  ): Promise<TrustSignal[]> {
    return this.trustSignalsService.getSignalsByEntity({
      entityType,
      identityId,
      orgId,
      signalType,
      source,
    });
  }

  @Get('v1/trust-score/:entityType/:entityId')
  @UseGuards(ApiKeyGuard)
  getScore(
    @Param('entityType') entityType: EntityType,
    @Param('entityId') entityId: string,
  ): Promise<ComputedTrustScore> {
    return this.trustSignalsService.computeTrustScore(entityType, entityId);
  }
}
