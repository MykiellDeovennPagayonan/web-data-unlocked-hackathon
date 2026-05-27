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
import { BackgroundChecksService } from './background-checks.service';
import { CreateBackgroundCheckDto } from './dto/create-background-check.dto';
import { CompleteBackgroundCheckDto } from './dto/complete-background-check.dto';
import { BackgroundCheck } from './entities/background-check.entity';
import {
  EntityType,
  CheckTrigger,
  CheckVerdict,
} from '../../../generated/client';

@Controller()
export class BackgroundChecksController {
  constructor(
    private readonly backgroundChecksService: BackgroundChecksService,
  ) {}

  @Post('v1/background-checks')
  @UseGuards(ApiKeyGuard)
  create(@Body() dto: CreateBackgroundCheckDto): Promise<BackgroundCheck> {
    return this.backgroundChecksService.createBackgroundCheck({
      entityType: dto.entityType,
      identityId: dto.identityId,
      orgId: dto.orgId,
      triggeredBy: dto.triggeredBy,
    });
  }

  @Get('v1/background-checks/:id')
  @UseGuards(ApiKeyGuard)
  getById(@Param('id') id: string): Promise<BackgroundCheck | null> {
    return this.backgroundChecksService.getBackgroundCheckById(id);
  }

  @Post('v1/background-checks/:id/complete')
  @UseGuards(ApiKeyGuard)
  complete(
    @Param('id') id: string,
    @Body() dto: CompleteBackgroundCheckDto,
  ): Promise<BackgroundCheck> {
    return this.backgroundChecksService.completeBackgroundCheck({
      checkId: id,
      overallVerdict: dto.overallVerdict,
    });
  }

  @Get('admin/background-checks')
  list(
    @Query('entityType') entityType?: EntityType,
    @Query('identityId') identityId?: string,
    @Query('orgId') orgId?: string,
    @Query('triggeredBy') triggeredBy?: CheckTrigger,
    @Query('overallVerdict') overallVerdict?: CheckVerdict,
  ): Promise<BackgroundCheck[]> {
    return this.backgroundChecksService.listBackgroundChecksByEntity({
      entityType,
      identityId,
      orgId,
      triggeredBy,
      overallVerdict,
    });
  }
}
