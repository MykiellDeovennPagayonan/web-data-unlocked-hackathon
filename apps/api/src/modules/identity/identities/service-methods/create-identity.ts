import { IdentitiesRepository } from '../identities.repository';
import { CreateIdentityData, Identity } from '../entities/identity.entity';

export async function createIdentity(
  repository: IdentitiesRepository,
  input: CreateIdentityData,
): Promise<Identity> {
  const existing = await repository.findByEmailHash(input.emailHash);
  if (existing) {
    throw new Error('Identity already exists');
  }
  return repository.insert(input);
}
