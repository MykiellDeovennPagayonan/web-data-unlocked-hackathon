import { OrganizationsRepository } from '../organizations.repository';
import {
  Organization,
  UpdateOrganizationData,
} from '../entities/organization.entity';

export function updateTrustStatus(
  repository: OrganizationsRepository,
  id: string,
  status: UpdateOrganizationData['trustStatus'],
): Promise<Organization> {
  return repository.update(id, { trustStatus: status });
}
