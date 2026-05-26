import { PrismaService } from '../../../../prisma/prisma.service';
import { Organization } from '../entities/organization.entity';

export function findOrganizationByDomain(
  prisma: PrismaService,
  domain: string,
): Promise<Organization | null> {
  return prisma.organization.findUnique({
    where: { domain },
  });
}
