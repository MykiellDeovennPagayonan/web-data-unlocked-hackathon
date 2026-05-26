import { IdentitiesRepository } from '../identities.repository';
import { Identity } from '../entities/identity.entity';

export function getIdentityByEmailHash(
  repository: IdentitiesRepository,
  emailHash: string,
): Promise<Identity | null> {
  return repository.findByEmailHash(emailHash);
}
