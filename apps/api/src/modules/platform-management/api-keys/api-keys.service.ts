import { Injectable } from '@nestjs/common';
import { AuditLogsService } from '../../compliance/audit-logs/audit-logs.service';
import { AuditActorType } from '../../../generated/client';
import { ApiKeysRepository } from './api-keys.repository';
import {
  createApiKey,
  CreateApiKeyResult,
} from './service-methods/create-api-key';
import { getApiKeyByHash } from './service-methods/get-api-key-by-hash';
import { listApiKeysByPlatform } from './service-methods/list-api-keys-by-platform';
import { revokeApiKey } from './service-methods/revoke-api-key';
import {
  rotateApiKey,
  RotateApiKeyResult,
} from './service-methods/rotate-api-key';
import { validateApiKey } from './service-methods/validate-api-key';
import { ApiKey, CreateApiKeyData } from './entities/api-key.entity';

@Injectable()
export class ApiKeysService {
  constructor(
    private readonly repository: ApiKeysRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  createApiKey = (
    platformId: string,
    input: CreateApiKeyData,
    auditMeta?: { actorType: AuditActorType; actorId: string },
  ): Promise<CreateApiKeyResult> =>
    createApiKey(
      this.repository,
      this.auditLogsService,
      platformId,
      input,
      auditMeta,
    );

  getApiKeyByHash = (keyHash: string): Promise<ApiKey | null> =>
    getApiKeyByHash(this.repository, keyHash);

  listApiKeysByPlatform = (
    platformId: string,
    isActive?: boolean,
  ): Promise<ApiKey[]> =>
    listApiKeysByPlatform(this.repository, platformId, isActive);

  revokeApiKey = (id: string): Promise<ApiKey> =>
    revokeApiKey(this.repository, this.auditLogsService, id);

  rotateApiKey = (
    oldKeyId: string,
    newKeyData: CreateApiKeyData,
  ): Promise<RotateApiKeyResult> =>
    rotateApiKey(this.repository, this.auditLogsService, oldKeyId, newKeyData);

  validateApiKey = (keyHash: string): Promise<ApiKey | null> =>
    validateApiKey(this.repository, keyHash);
}
