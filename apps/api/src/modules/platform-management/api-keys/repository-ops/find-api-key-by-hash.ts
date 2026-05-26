import { PrismaService } from '../../../../prisma/prisma.service';
import { ApiKey } from '../entities/api-key.entity';

export function findApiKeyByHash(
  prisma: PrismaService,
  keyHash: string,
): Promise<ApiKey | null> {
  return prisma.apiKey.findFirst({
    where: { keyHash },
  });
}
