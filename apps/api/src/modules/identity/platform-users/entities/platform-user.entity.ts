import {
  PlatformUser as PrismaPlatformUser,
  PlatformUserStatus,
} from '../../../../../generated/prisma/client';

export type PlatformUser = PrismaPlatformUser;

export interface CreatePlatformUserData {
  identityId: string;
  platformId: string;
  externalUserId: string;
  statusOnPlatform?: PlatformUserStatus;
}

export interface UpdatePlatformUserData {
  statusOnPlatform?: PlatformUserStatus;
}

export interface PlatformUserFilters {
  platformId?: string;
  identityId?: string;
  statusOnPlatform?: PlatformUserStatus;
  limit?: number;
  offset?: number;
}
