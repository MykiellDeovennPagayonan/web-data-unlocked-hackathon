import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiKeyGuard } from '../../../common/guards/api-key.guard';
import { CurrentPlatform } from '../../../common/decorators/current-platform.decorator';
import { PlatformRulesService } from './platform-rules.service';
import { CreatePlatformRuleDto } from './dto/create-platform-rule.dto';
import { UpdatePlatformRuleDto } from './dto/update-platform-rule.dto';
import { ApplyPresetRulesDto } from './dto/preset-rules.dto';
import { PlatformRule } from './entities/platform-rule.entity';

@Controller('v1/platform/rules')
export class PlatformRulesController {
  constructor(private readonly platformRulesService: PlatformRulesService) {}

  @Get()
  @UseGuards(ApiKeyGuard)
  listRules(@CurrentPlatform() platformId: string): Promise<PlatformRule[]> {
    return this.platformRulesService.listRulesByPlatform({ platformId });
  }

  @Post()
  @UseGuards(ApiKeyGuard)
  createRule(
    @CurrentPlatform() platformId: string,
    @Body() dto: CreatePlatformRuleDto,
  ): Promise<PlatformRule> {
    return this.platformRulesService.createPlatformRule({
      platformId,
      ruleTrigger: dto.ruleTrigger,
      conditionJson: dto.conditionJson,
      action: dto.action,
    });
  }

  @Patch(':id')
  updateRule(
    @Param('id') id: string,
    @Body() dto: UpdatePlatformRuleDto,
  ): Promise<PlatformRule> {
    return this.platformRulesService.updatePlatformRule(id, dto);
  }

  @Delete(':id')
  deleteRule(@Param('id') id: string): Promise<PlatformRule> {
    return this.platformRulesService.deletePlatformRule(id);
  }

  @Post(':id/toggle')
  toggleRule(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ): Promise<PlatformRule> {
    return this.platformRulesService.toggleRule(id, isActive);
  }

  @Post('apply-preset')
  @UseGuards(ApiKeyGuard)
  applyPreset(
    @CurrentPlatform() platformId: string,
    @Body() dto: ApplyPresetRulesDto,
  ): Promise<void> {
    return this.platformRulesService.applyStrictnessPreset(
      platformId,
      dto.strictnessLevel,
    );
  }
}
