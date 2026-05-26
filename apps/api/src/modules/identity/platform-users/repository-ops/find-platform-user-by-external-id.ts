import { PrismaService } from '../../../../prisma/prisma.service';
import { PlatformUser } from '../entities/platform-user.entity';

export function findPlatformUserByExternalId(
  prisma: PrismaService,
  platformId: string,
  externalUserId: string,
): Promise<PlatformUser | null> {
  return prisma.platformUser.findFirst({
    where: { platformId, externalUserId },
  });
}
