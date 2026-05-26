import { PrismaService } from '../../../../prisma/prisma.service';
import { Platform } from '../entities/platform.entity';

export function findPlatformById(
  prisma: PrismaService,
  id: string,
): Promise<Platform | null> {
  return prisma.platform.findUnique({
    where: { id },
  });
}
