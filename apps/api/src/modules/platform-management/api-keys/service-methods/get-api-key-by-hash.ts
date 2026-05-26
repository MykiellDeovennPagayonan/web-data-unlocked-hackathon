import { ApiKeysRepository } from '../api-keys.repository';
import { ApiKey } from '../entities/api-key.entity';

export function getApiKeyByHash(
  repository: ApiKeysRepository,
  keyHash: string,
): Promise<ApiKey | null> {
  return repository.findByHash(keyHash);
}
