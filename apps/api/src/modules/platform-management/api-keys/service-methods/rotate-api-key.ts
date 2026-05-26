import { randomBytes, createHash } from 'crypto';
import { ApiKeysRepository } from '../api-keys.repository';
import { ApiKey, CreateApiKeyData } from '../entities/api-key.entity';

export interface RotateApiKeyResult {
  apiKey: ApiKey;
  rawKey: string;
}

export async function rotateApiKey(
  repository: ApiKeysRepository,
  oldKeyId: string,
  newKeyData: CreateApiKeyData,
): Promise<RotateApiKeyResult> {
  // Revoke the old key
  await repository.update(oldKeyId, { revokedAt: new Date() });

  // Generate new key
  const rawKey = `tl_${randomBytes(32).toString('hex')}`;
  const keyHash = createHash('sha256').update(rawKey).digest('hex');

  const apiKey = await repository.insert({
    platformId: newKeyData.platformId,
    name: newKeyData.name,
    scopes: newKeyData.scopes,
    expiresAt: newKeyData.expiresAt,
  });

  // Update with the hash
  await repository.update(apiKey.id, { keyHash });

  return { apiKey, rawKey };
}
