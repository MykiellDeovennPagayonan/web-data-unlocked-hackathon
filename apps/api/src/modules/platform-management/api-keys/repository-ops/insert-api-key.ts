import { PrismaService } from '../../../../prisma/prisma.service';
import { ApiKey, CreateApiKeyData } from '../entities/api-key.entity';

export function insertApiKey(
  prisma: PrismaService,
  data: CreateApiKeyData,
): Promise<ApiKey> {
  return prisma.apiKey.create({
    data: {
      platformId: data.platformId,
      name: data.name,
      keyHash: '', // Will be set by service method
      scopes: data.scopes,
      expiresAt: data.expiresAt,
    },
  });
}
