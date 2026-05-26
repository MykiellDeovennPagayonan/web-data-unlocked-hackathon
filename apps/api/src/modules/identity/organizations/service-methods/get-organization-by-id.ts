import { OrganizationsRepository } from '../organizations.repository';
import { Organization } from '../entities/organization.entity';

export function getOrganizationById(
  repository: OrganizationsRepository,
  id: string,
): Promise<Organization | null> {
  return repository.findById(id);
}
