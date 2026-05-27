import { Injectable } from '@nestjs/common';
import { AuditLogsService } from '../../compliance/audit-logs/audit-logs.service';
import { PlatformUsersRepository } from './platform-users.repository';
import { createPlatformUser } from './service-methods/create-platform-user';
import { getPlatformUserById } from './service-methods/get-platform-user-by-id';
import { updatePlatformUserStatus } from './service-methods/update-platform-user-status';
import {
  CreatePlatformUserData,
  PlatformUser,
  UpdatePlatformUserData,
} from './entities/platform-user.entity';

@Injectable()
export class PlatformUsersService {
  constructor(
    private readonly repository: PlatformUsersRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  createPlatformUser = (input: CreatePlatformUserData): Promise<PlatformUser> =>
    createPlatformUser(this.repository, this.auditLogsService, input);

  getPlatformUserById = (id: string): Promise<PlatformUser | null> =>
    getPlatformUserById(this.repository, id);

  getPlatformUserByExternalId = (
    platformId: string,
    externalUserId: string,
  ): Promise<PlatformUser | null> =>
    this.repository.findByExternalId(platformId, externalUserId);

  updatePlatformUserStatus = (
    id: string,
    status: UpdatePlatformUserData['statusOnPlatform'],
  ): Promise<PlatformUser> =>
    updatePlatformUserStatus(
      this.repository,
      this.auditLogsService,
      id,
      status,
    );
}
