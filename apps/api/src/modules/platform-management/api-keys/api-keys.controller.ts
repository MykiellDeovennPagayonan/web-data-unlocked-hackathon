import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiKeyGuard } from '../../../common/guards/api-key.guard';
import { CurrentPlatform } from '../../../common/decorators/current-platform.decorator';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { RotateApiKeyDto } from './dto/rotate-api-key.dto';
import { ApiKey } from './entities/api-key.entity';

interface ApiKeyResponse {
  id: string;
  name: string;
  scopes: string[];
  createdAt: Date;
  expiresAt: Date | null;
  revokedAt: Date | null;
  lastUsedAt: Date | null;
}

@Controller('v1/platform/api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Get()
  @UseGuards(ApiKeyGuard)
  async listApiKeys(
    @CurrentPlatform() platformId: string,
  ): Promise<ApiKeyResponse[]> {
    const keys = await this.apiKeysService.listApiKeysByPlatform(platformId);
    return keys.map((key) => this.mapToResponse(key));
  }

  @Post()
  // @UseGuards(ApiKeyGuard)
  async createApiKey(
    @CurrentPlatform() platformId: string,
    @Body() dto: CreateApiKeyDto,
  ): Promise<{ apiKey: ApiKeyResponse; rawKey: string }> {
    const result = await this.apiKeysService.createApiKey(platformId, {
      platformId,
      name: dto.name,
      scopes: dto.scopes,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    });
    return {
      apiKey: this.mapToResponse(result.apiKey),
      rawKey: result.rawKey,
    };
  }

  @Delete(':id')
  revokeApiKey(@Param('id') id: string): Promise<ApiKeyResponse> {
    return this.apiKeysService
      .revokeApiKey(id)
      .then((key) => this.mapToResponse(key));
  }

  @Post(':id/rotate')
  @UseGuards(ApiKeyGuard)
  async rotateApiKey(
    @CurrentPlatform() platformId: string,
    @Param('id') id: string,
    @Body() dto: RotateApiKeyDto,
  ): Promise<{ apiKey: ApiKeyResponse; rawKey: string }> {
    const result = await this.apiKeysService.rotateApiKey(id, {
      platformId,
      name: dto.name,
      scopes: [], // Preserve scopes from old key in production
    });
    return {
      apiKey: this.mapToResponse(result.apiKey),
      rawKey: result.rawKey,
    };
  }

  private mapToResponse(apiKey: ApiKey): ApiKeyResponse {
    return {
      id: apiKey.id,
      name: apiKey.name,
      scopes: apiKey.scopes as string[],
      createdAt: apiKey.createdAt,
      expiresAt: apiKey.expiresAt,
      revokedAt: apiKey.revokedAt,
      lastUsedAt: apiKey.lastUsedAt,
    };
  }
}
