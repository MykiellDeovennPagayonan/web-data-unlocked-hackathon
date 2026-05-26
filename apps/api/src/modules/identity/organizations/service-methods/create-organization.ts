import { OrganizationsRepository } from '../organizations.repository';
import {
  CreateOrganizationData,
  Organization,
} from '../entities/organization.entity';

export async function createOrganization(
  repository: OrganizationsRepository,
  input: CreateOrganizationData,
): Promise<Organization> {
  const existing = await repository.findByDomain(input.domain);
  if (existing) {
    throw new Error('Organization with this domain already exists');
  }
  return repository.insert(input);
}
