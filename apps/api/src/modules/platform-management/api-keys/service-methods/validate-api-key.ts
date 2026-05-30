import { ApiKeysRepository } from '../api-keys.repository';
import { ApiKey } from '../entities/api-key.entity';

export async function validateApiKey(
  repository: ApiKeysRepository,
  keyHash: string,
): Promise<ApiKey | null> {
  const apiKey = await repository.findByHash(keyHash);

  if (!apiKey) return null;
  if (apiKey.revokedAt) return null;
  if (apiKey.expiresAt && apiKey.expiresAt <= new Date()) return null;

  return apiKey;
}
