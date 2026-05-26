import { randomBytes, createHash } from 'crypto';
import { ApiKeysRepository } from '../api-keys.repository';
import { ApiKey, CreateApiKeyData } from '../entities/api-key.entity';

export interface CreateApiKeyResult {
  apiKey: ApiKey;
  rawKey: string;
}

export async function createApiKey(
  repository: ApiKeysRepository,
  platformId: string,
  input: CreateApiKeyData,
): Promise<CreateApiKeyResult> {
  // Generate a secure random key
  const rawKey = `tl_${randomBytes(32).toString('hex')}`;
  const keyHash = createHash('sha256').update(rawKey).digest('hex');

  const apiKey = await repository.insert({
    platformId,
    name: input.name,
    scopes: input.scopes,
    expiresAt: input.expiresAt,
  });

  // Update with the hash after creation
  await repository.update(apiKey.id, { keyHash });

  return { apiKey, rawKey };
}
