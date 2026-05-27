import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiKeyGuard } from '../../../common/guards/api-key.guard';
import { CurrentPlatform } from '../../../common/decorators/current-platform.decorator';
import { PlatformsService } from './platforms.service';
import { CreatePlatformDto } from './dto/create-platform.dto';
import { UpdatePlatformDto } from './dto/update-platform.dto';
import { UpdateStrictnessDto } from './dto/update-strictness.dto';
import { Platform, PlatformFilters } from './entities/platform.entity';
import { PlatformStatus } from 'src/generated/enums';

@Controller()
export class PlatformsController {
  constructor(private readonly platformsService: PlatformsService) {}

  @Post('admin/platforms')
  createPlatform(@Body() dto: CreatePlatformDto): Promise<Platform> {
    return this.platformsService.createPlatform(dto);
  }

  @Get('admin/platforms')
  listPlatforms(
    @Query('status') status?: PlatformStatus,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<Platform[]> {
    const filters: PlatformFilters = {
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    };
    return this.platformsService.listPlatforms(filters);
  }

  @Get('admin/platforms/:id')
  getPlatformById(@Param('id') id: string): Promise<Platform | null> {
    return this.platformsService.getPlatformById(id);
  }

  @Patch('admin/platforms/:id/status')
  updatePlatformStatus(
    @Param('id') id: string,
    @Body('status') status: PlatformStatus,
  ): Promise<Platform> {
    return this.platformsService.updatePlatformStatus(id, status);
  }

  @Get('v1/platform')
  @UseGuards(ApiKeyGuard)
  getCurrentPlatform(
    @CurrentPlatform() platformId: string,
  ): Promise<Platform | null> {
    return this.platformsService.getPlatformById(platformId);
  }

  @Patch('v1/platform')
  @UseGuards(ApiKeyGuard)
  updateCurrentPlatform(
    @CurrentPlatform() platformId: string,
    @Body() dto: UpdatePlatformDto,
  ): Promise<Platform> {
    return this.platformsService.updatePlatform(platformId, dto);
  }

  @Patch('v1/platform/strictness')
  @UseGuards(ApiKeyGuard)
  updateStrictness(
    @CurrentPlatform() platformId: string,
    @Body() dto: UpdateStrictnessDto,
  ): Promise<Platform> {
    return this.platformsService.updateStrictnessLevel(
      platformId,
      dto.strictnessLevel,
    );
  }
}
