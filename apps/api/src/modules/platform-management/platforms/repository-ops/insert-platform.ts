import { PrismaService } from '../../../../prisma/prisma.service';
import { CreatePlatformData, Platform } from '../entities/platform.entity';

export function insertPlatform(
  prisma: PrismaService,
  data: CreatePlatformData,
): Promise<Platform> {
  return prisma.platform.create({
    data: {
      name: data.name,
      domain: data.domain,
      status: data.status ?? 'trial',
      strictnessLevel: data.strictnessLevel,
    },
  });
}
