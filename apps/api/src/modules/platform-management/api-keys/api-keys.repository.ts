import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { insertApiKey } from './repository-ops/insert-api-key';
import { findApiKeyById } from './repository-ops/find-api-key-by-id';
import { findApiKeyByHash } from './repository-ops/find-api-key-by-hash';
import { findApiKeysByPlatform } from './repository-ops/find-api-keys-by-platform';
import { updateApiKey } from './repository-ops/update-api-key';
import { deleteExpiredKeys } from './repository-ops/delete-expired-keys';
import {
  ApiKey,
  ApiKeyFilters,
  CreateApiKeyData,
  UpdateApiKeyData,
} from './entities/api-key.entity';

@Injectable()
export class ApiKeysRepository {
  constructor(private readonly prisma: PrismaService) {}

  insert = (data: CreateApiKeyData): Promise<ApiKey> =>
    insertApiKey(this.prisma, data);

  findById = (id: string): Promise<ApiKey | null> =>
    findApiKeyById(this.prisma, id);

  findByHash = (keyHash: string): Promise<ApiKey | null> =>
    findApiKeyByHash(this.prisma, keyHash);

  findByPlatform = (filters: ApiKeyFilters): Promise<ApiKey[]> =>
    findApiKeysByPlatform(this.prisma, filters);

  update = (id: string, data: UpdateApiKeyData): Promise<ApiKey> =>
    updateApiKey(this.prisma, id, data);

  deleteExpired = (before: Date): Promise<number> =>
    deleteExpiredKeys(this.prisma, before);
}
