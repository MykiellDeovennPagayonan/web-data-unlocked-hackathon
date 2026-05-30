import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
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

@Controller('admin/api-keys')
export class AdminApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Get('platforms/:platformId')
  async listApiKeysByPlatform(
    @Param('platformId') platformId: string,
  ): Promise<ApiKeyResponse[]> {
    const keys = await this.apiKeysService.listApiKeysByPlatform(platformId);
    return keys.map((k) => this.mapToResponse(k));
  }

  @Post('platforms/:platformId')
  async createApiKeyForPlatform(
    @Param('platformId') platformId: string,
    @Body() dto: CreateApiKeyDto,
  ): Promise<{ apiKey: ApiKeyResponse; rawKey: string }> {
    const result = await this.apiKeysService.createApiKey(
      platformId,
      {
        platformId,
        name: dto.name,
        scopes: dto.scopes,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
      { actorType: 'admin', actorId: 'admin' },
    );
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
