import { PrismaService } from '../../../../prisma/prisma.service';
import {
  PlatformUser,
  UpdatePlatformUserData,
} from '../entities/platform-user.entity';

export function updatePlatformUser(
  prisma: PrismaService,
  id: string,
  data: UpdatePlatformUserData,
): Promise<PlatformUser> {
  return prisma.platformUser.update({
    where: { id },
    data: {
      ...(data.statusOnPlatform !== undefined && {
        statusOnPlatform: data.statusOnPlatform,
      }),
    },
  });
}
