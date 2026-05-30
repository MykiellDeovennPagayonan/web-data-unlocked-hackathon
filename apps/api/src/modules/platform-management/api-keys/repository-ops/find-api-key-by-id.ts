import { PrismaService } from '../../../../prisma/prisma.service';
import { ApiKey } from '../entities/api-key.entity';

export function findApiKeyById(
  prisma: PrismaService,
  id: string,
): Promise<ApiKey | null> {
  return prisma.apiKey.findUnique({
    where: { id },
  });
}
