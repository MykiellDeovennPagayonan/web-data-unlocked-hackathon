import { Injectable } from '@nestjs/common';
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
  constructor(private readonly repository: ApiKeysRepository) {}

  createApiKey = (
    platformId: string,
    input: CreateApiKeyData,
  ): Promise<CreateApiKeyResult> =>
    createApiKey(this.repository, platformId, input);

  getApiKeyByHash = (keyHash: string): Promise<ApiKey | null> =>
    getApiKeyByHash(this.repository, keyHash);

  listApiKeysByPlatform = (
    platformId: string,
    isActive?: boolean,
  ): Promise<ApiKey[]> =>
    listApiKeysByPlatform(this.repository, platformId, isActive);

  revokeApiKey = (id: string): Promise<ApiKey> =>
    revokeApiKey(this.repository, id);

  rotateApiKey = (
    oldKeyId: string,
    newKeyData: CreateApiKeyData,
  ): Promise<RotateApiKeyResult> =>
    rotateApiKey(this.repository, oldKeyId, newKeyData);

  validateApiKey = (keyHash: string): Promise<ApiKey | null> =>
    validateApiKey(this.repository, keyHash);
}
