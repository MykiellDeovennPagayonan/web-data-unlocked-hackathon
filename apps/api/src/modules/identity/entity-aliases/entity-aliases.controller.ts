import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { EntityAliasesService } from './entity-aliases.service';
import { CreateEntityAliasDto } from './dto/create-entity-alias.dto';
import { ResolveAliasDto } from './dto/resolve-alias.dto';
import { EntityAlias } from './entities/entity-alias.entity';
import { EntityType } from '../../../generated/client';

@Controller()
export class EntityAliasesController {
  constructor(private readonly entityAliasesService: EntityAliasesService) {}

  @Post('admin/aliases')
  createAlias(@Body() dto: CreateEntityAliasDto): Promise<EntityAlias> {
    return this.entityAliasesService.createAlias(dto);
  }

  @Get('admin/aliases/entity/:entityType/:entityId')
  getAliasesByEntity(
    @Param('entityType') entityType: EntityType,
    @Param('entityId') entityId: string,
  ): Promise<EntityAlias[]> {
    return this.entityAliasesService.getAliasesByEntity(entityType, entityId);
  }

  @Post('admin/aliases/resolve')
  resolveCanonicalEntity(
    @Body() dto: ResolveAliasDto,
  ): Promise<EntityAlias | null> {
    return this.entityAliasesService.resolveCanonicalEntity(
      dto.aliasType,
      dto.aliasValueHash,
    );
  }

  @Patch('admin/aliases/:id/confidence')
  updateAliasConfidence(
    @Param('id') id: string,
    @Body('confidence') confidence: number,
  ): Promise<EntityAlias> {
    return this.entityAliasesService.updateAliasConfidence(id, confidence);
  }
}
