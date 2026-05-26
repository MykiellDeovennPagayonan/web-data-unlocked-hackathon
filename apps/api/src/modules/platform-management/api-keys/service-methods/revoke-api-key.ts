import { ApiKeysRepository } from '../api-keys.repository';
import { ApiKey } from '../entities/api-key.entity';

export function revokeApiKey(
  repository: ApiKeysRepository,
  id: string,
): Promise<ApiKey> {
  return repository.update(id, { revokedAt: new Date() });
}
