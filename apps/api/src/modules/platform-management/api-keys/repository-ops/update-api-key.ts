import { PrismaService } from '../../../../prisma/prisma.service';
import { ApiKey, UpdateApiKeyData } from '../entities/api-key.entity';

export function updateApiKey(
  prisma: PrismaService,
  id: string,
  data: UpdateApiKeyData,
): Promise<ApiKey> {
  return prisma.apiKey.update({
    where: { id },
    data: {
      ...(data.keyHash && { keyHash: data.keyHash }),
      ...(data.lastUsedAt && { lastUsedAt: data.lastUsedAt }),
      ...(data.revokedAt && { revokedAt: data.revokedAt }),
    },
  });
}
