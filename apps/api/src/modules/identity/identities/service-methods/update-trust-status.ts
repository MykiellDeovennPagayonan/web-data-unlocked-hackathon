import { IdentitiesRepository } from '../identities.repository';
import { Identity, UpdateIdentityData } from '../entities/identity.entity';

export function updateTrustStatus(
  repository: IdentitiesRepository,
  id: string,
  status: UpdateIdentityData['trustStatus'],
): Promise<Identity> {
  return repository.update(id, { trustStatus: status });
}
