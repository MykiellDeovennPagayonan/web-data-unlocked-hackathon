import { PrismaService } from '../../../../prisma/prisma.service';
import {
  CreatePlatformUserData,
  PlatformUser,
} from '../entities/platform-user.entity';

export function insertPlatformUser(
  prisma: PrismaService,
  data: CreatePlatformUserData,
): Promise<PlatformUser> {
  return prisma.platformUser.create({
    data: {
      identityId: data.identityId,
      platformId: data.platformId,
      externalUserId: data.externalUserId,
      statusOnPlatform: data.statusOnPlatform ?? 'active',
    },
  });
}
