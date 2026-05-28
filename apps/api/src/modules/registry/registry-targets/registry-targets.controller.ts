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
import { RegistryTargetsService } from './registry-targets.service';
import { CreateRegistryTargetDto } from './dto/create-registry-target.dto';
import { RegistryTarget } from './entities/registry-target.entity';
import { RegistryEntry } from '../registry-entries/entities/registry-entry.entity';
import { hashEmail } from '../../../common/crypto/hash';
import { TargetType } from '../../../generated/client';

@Controller()
export class RegistryTargetsController {
  constructor(
    private readonly registryTargetsService: RegistryTargetsService,
  ) {}

  @Post('v1/registry/targets')
  @UseGuards(ApiKeyGuard)
  create(@Body() dto: CreateRegistryTargetDto): Promise<RegistryTarget> {
    return this.registryTargetsService.createTarget({
      registryEntryId: dto.registryEntryId,
      targetType: dto.targetType,
      identityId: dto.identityId,
      orgId: dto.orgId,
      ipId: dto.ipId,
      deviceId: dto.deviceId,
      emailHash: dto.email ? hashEmail(dto.email) : undefined,
    });
  }

  @Get('v1/registry/entries/:id/targets')
  @UseGuards(ApiKeyGuard)
  getByEntry(@Param('id') registryEntryId: string): Promise<RegistryTarget[]> {
    return this.registryTargetsService.getTargetsByEntry(registryEntryId);
  }

  @Get('admin/registry/lookup')
  lookup(
    @Query('targetType') targetType: TargetType,
    @Query('identityId') identityId?: string,
    @Query('orgId') orgId?: string,
    @Query('ipId') ipId?: string,
    @Query('deviceId') deviceId?: string,
    @Query('email') email?: string,
  ): Promise<RegistryEntry[]> {
    return this.registryTargetsService.findEntriesByEntity({
      targetType,
      identityId,
      orgId,
      ipId,
      deviceId,
      emailHash: email ? hashEmail(email) : undefined,
    });
  }
}
