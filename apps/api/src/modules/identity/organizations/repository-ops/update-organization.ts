import { PrismaService } from '../../../../prisma/prisma.service';
import {
  Organization,
  UpdateOrganizationData,
} from '../entities/organization.entity';

export function updateOrganization(
  prisma: PrismaService,
  id: string,
  data: UpdateOrganizationData,
): Promise<Organization> {
  return prisma.organization.update({
    where: { id },
    data: {
      ...(data.legalName !== undefined && { legalName: data.legalName }),
      ...(data.domain !== undefined && { domain: data.domain }),
      ...(data.trustStatus !== undefined && { trustStatus: data.trustStatus }),
    },
  });
}
