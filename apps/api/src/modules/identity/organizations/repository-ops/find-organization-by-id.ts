import { PrismaService } from '../../../../prisma/prisma.service';
import { Organization } from '../entities/organization.entity';

export function findOrganizationById(
  prisma: PrismaService,
  id: string,
): Promise<Organization | null> {
  return prisma.organization.findUnique({
    where: { id },
  });
}
