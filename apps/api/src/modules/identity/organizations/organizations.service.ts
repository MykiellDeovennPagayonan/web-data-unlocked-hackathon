import { Injectable } from '@nestjs/common';
import { AuditLogsService } from '../../compliance/audit-logs/audit-logs.service';
import { OrganizationsRepository } from './organizations.repository';
import { createOrganization } from './service-methods/create-organization';
import { getOrganizationById } from './service-methods/get-organization-by-id';
import { getOrganizationByDomain } from './service-methods/get-organization-by-domain';
import { updateTrustStatus } from './service-methods/update-trust-status';
import {
  CreateOrganizationData,
  Organization,
  UpdateOrganizationData,
} from './entities/organization.entity';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly repository: OrganizationsRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  createOrganization = (input: CreateOrganizationData): Promise<Organization> =>
    createOrganization(this.repository, this.auditLogsService, input);

  getOrganizationById = (id: string): Promise<Organization | null> =>
    getOrganizationById(this.repository, id);

  getOrganizationByDomain = (domain: string): Promise<Organization | null> =>
    getOrganizationByDomain(this.repository, domain);

  listOrganizations = (take?: number, skip?: number): Promise<Organization[]> =>
    this.repository.findMany(take, skip);

  updateTrustStatus = (
    id: string,
    status: UpdateOrganizationData['trustStatus'],
  ): Promise<Organization> =>
    updateTrustStatus(this.repository, this.auditLogsService, id, status);
}
