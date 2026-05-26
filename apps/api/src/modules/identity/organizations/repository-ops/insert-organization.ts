import { PrismaService } from '../../../../prisma/prisma.service';
import {
  CreateOrganizationData,
  Organization,
} from '../entities/organization.entity';

export function insertOrganization(
  prisma: PrismaService,
  data: CreateOrganizationData,
): Promise<Organization> {
  return prisma.organization.create({
    data: {
      legalName: data.legalName,
      domain: data.domain,
      registrationNumber: data.registrationNumber,
      country: data.country,
      industry: data.industry,
      trustStatus: data.trustStatus ?? 'clean',
      submittedByPlatformId: data.submittedByPlatformId,
    },
  });
}
