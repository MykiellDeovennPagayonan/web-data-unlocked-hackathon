import { ApiKeysRepository } from '../api-keys.repository';
import { ApiKey } from '../entities/api-key.entity';

export function listApiKeysByPlatform(
  repository: ApiKeysRepository,
  platformId: string,
  isActive?: boolean,
): Promise<ApiKey[]> {
  return repository.findByPlatform({ platformId, isActive });
}
