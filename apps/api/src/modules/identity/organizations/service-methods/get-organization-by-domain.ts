import { OrganizationsRepository } from '../organizations.repository';
import { Organization } from '../entities/organization.entity';

export function getOrganizationByDomain(
  repository: OrganizationsRepository,
  domain: string,
): Promise<Organization | null> {
  return repository.findByDomain(domain);
}
