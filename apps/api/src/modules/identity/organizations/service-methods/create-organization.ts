import { OrganizationsRepository } from '../organizations.repository';
import { AuditLogsService } from '../../../compliance/audit-logs/audit-logs.service';
import { AuditActorType } from '../../../../generated/client';
import {
  CreateOrganizationData,
  Organization,
} from '../entities/organization.entity';

export async function createOrganization(
  repository: OrganizationsRepository,
  auditLogsService: AuditLogsService,
  input: CreateOrganizationData,
): Promise<Organization> {
  const existing = await repository.findByDomain(input.domain);
  if (existing) {
    throw new Error('Organization with this domain already exists');
  }
  const org = await repository.insert(input);

  await auditLogsService.logAction({
    actorType: AuditActorType.system,
    actorId: 'system',
    action: 'organization_created',
    targetType: 'organization',
    targetId: org.id,
    newValue: {
      legalName: org.legalName,
      domain: org.domain,
      trustStatus: org.trustStatus,
    },
  });

  return org;
}
