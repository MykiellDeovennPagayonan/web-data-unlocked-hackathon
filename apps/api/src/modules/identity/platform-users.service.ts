import { Injectable } from '@nestjs/common';
import { PlatformUsersRepository } from './platform-users/platform-users.repository';
import { createPlatformUser } from './platform-users/service-methods/create-platform-user';
import { getPlatformUserById } from './platform-users/service-methods/get-platform-user-by-id';
import { updatePlatformUserStatus } from './platform-users/service-methods/update-platform-user-status';
import {
  CreatePlatformUserData,
  PlatformUser,
  UpdatePlatformUserData,
} from './platform-users/entities/platform-user.entity';

@Injectable()
export class PlatformUsersService {
  constructor(private readonly repository: PlatformUsersRepository) {}

  createPlatformUser = (input: CreatePlatformUserData): Promise<PlatformUser> =>
    createPlatformUser(this.repository, input);

  getPlatformUserById = (id: string): Promise<PlatformUser | null> =>
    getPlatformUserById(this.repository, id);

  updatePlatformUserStatus = (
    id: string,
    status: UpdatePlatformUserData['statusOnPlatform'],
  ): Promise<PlatformUser> =>
    updatePlatformUserStatus(this.repository, id, status);
}
