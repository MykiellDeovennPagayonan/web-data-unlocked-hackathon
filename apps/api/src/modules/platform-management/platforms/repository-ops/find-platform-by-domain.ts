import { PrismaService } from '../../../../prisma/prisma.service';
import { Platform } from '../entities/platform.entity';

export function findPlatformByDomain(
  prisma: PrismaService,
  domain: string,
): Promise<Platform | null> {
  return prisma.platform.findFirst({
    where: { domain },
  });
}
