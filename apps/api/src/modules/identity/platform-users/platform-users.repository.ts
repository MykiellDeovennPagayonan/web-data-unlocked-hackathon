import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { insertPlatformUser } from './repository-ops/insert-platform-user';
import { findPlatformUserById } from './repository-ops/find-platform-user-by-id';
import { findPlatformUserByExternalId } from './repository-ops/find-platform-user-by-external-id';
import { updatePlatformUser } from './repository-ops/update-platform-user';
import {
  CreatePlatformUserData,
  PlatformUser,
  UpdatePlatformUserData,
} from './entities/platform-user.entity';

@Injectable()
export class PlatformUsersRepository {
  constructor(public readonly prisma: PrismaService) {}

  insert = (data: CreatePlatformUserData): Promise<PlatformUser> =>
    insertPlatformUser(this.prisma, data);

  findById = (id: string): Promise<PlatformUser | null> =>
    findPlatformUserById(this.prisma, id);

  findByExternalId = (
    platformId: string,
    externalUserId: string,
  ): Promise<PlatformUser | null> =>
    findPlatformUserByExternalId(this.prisma, platformId, externalUserId);

  update = (id: string, data: UpdatePlatformUserData): Promise<PlatformUser> =>
    updatePlatformUser(this.prisma, id, data);
}
