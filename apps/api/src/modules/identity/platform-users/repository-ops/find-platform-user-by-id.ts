import { PrismaService } from '../../../../prisma/prisma.service';
import { PlatformUser } from '../entities/platform-user.entity';

export function findPlatformUserById(
  prisma: PrismaService,
  id: string,
): Promise<PlatformUser | null> {
  return prisma.platformUser.findUnique({
    where: { id },
  });
}
