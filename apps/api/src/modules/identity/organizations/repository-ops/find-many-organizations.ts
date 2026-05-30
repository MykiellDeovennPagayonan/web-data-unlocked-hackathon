import { PrismaService } from '../../../../prisma/prisma.service';
import { Organization } from '../entities/organization.entity';

export async function findManyOrganizations(
  prisma: PrismaService,
  take = 100,
  skip = 0,
): Promise<Organization[]> {
  return prisma.organization.findMany({
    orderBy: { createdAt: 'desc' },
    take,
    skip,
  });
}
