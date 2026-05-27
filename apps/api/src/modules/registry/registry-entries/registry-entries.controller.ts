import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiKeyGuard } from '../../../common/guards/api-key.guard';
import { RegistryEntriesService } from './registry-entries.service';
import { CreateRegistryEntryDto } from './dto/create-registry-entry.dto';
import { UpdateRegistryEntryDto } from './dto/update-registry-entry.dto';
import { RegistryEntry } from './entities/registry-entry.entity';
import {
  ListType,
  RegistrySeverity,
  RegistrySourceType,
} from '../../../generated/client';

@Controller()
export class RegistryEntriesController {
  constructor(
    private readonly registryEntriesService: RegistryEntriesService,
  ) {}

  @Post('v1/registry/entries')
  @UseGuards(ApiKeyGuard)
  create(@Body() dto: CreateRegistryEntryDto): Promise<RegistryEntry> {
    return this.registryEntriesService.createEntry({
      listType: dto.listType,
      severity: dto.severity,
      sourceType: dto.sourceType,
    });
  }

  @Get('v1/registry/entries/:id')
  @UseGuards(ApiKeyGuard)
  getById(@Param('id') id: string): Promise<RegistryEntry | null> {
    return this.registryEntriesService.getEntryById(id);
  }

  @Patch('v1/registry/entries/:id')
  @UseGuards(ApiKeyGuard)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRegistryEntryDto,
  ): Promise<RegistryEntry> {
    return this.registryEntriesService.updateEntry(id, dto);
  }

  @Post('v1/registry/entries/:id/escalate')
  @UseGuards(ApiKeyGuard)
  escalate(@Param('id') id: string): Promise<RegistryEntry> {
    return this.registryEntriesService.escalateSeverity(id);
  }

  @Get('admin/registry/entries')
  list(
    @Query('listType') listType?: ListType,
    @Query('severity') severity?: RegistrySeverity,
    @Query('sourceType') sourceType?: RegistrySourceType,
    @Query('isActive') isActive?: string,
  ): Promise<RegistryEntry[]> {
    return this.registryEntriesService.listEntries({
      listType,
      severity,
      sourceType,
      isActive: isActive === 'true',
    });
  }
}
