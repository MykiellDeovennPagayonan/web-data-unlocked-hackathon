import { IdentitiesRepository } from '../identities.repository';
import { Identity } from '../entities/identity.entity';

export function getIdentityById(
  repository: IdentitiesRepository,
  id: string,
): Promise<Identity | null> {
  return repository.findById(id);
}
