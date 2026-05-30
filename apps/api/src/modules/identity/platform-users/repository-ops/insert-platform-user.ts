import { PrismaService } from '../../../../prisma/prisma.service';
import {
  CreatePlatformUserData,
  PlatformUser,
} from '../entities/platform-user.entity';

export function insertPlatformUser(
  prisma: PrismaService,
  data: CreatePlatformUserData,
): Promise<PlatformUser> {
  if (!data.identityId) {
    throw new Error('identityId is required when creating a platform user');
  }
  return prisma.platformUser.create({
    data: {
      identityId: data.identityId,
      platformId: data.platformId,
      externalUserId: data.externalUserId,
      statusOnPlatform: data.statusOnPlatform ?? 'active',
    },
  });
}
