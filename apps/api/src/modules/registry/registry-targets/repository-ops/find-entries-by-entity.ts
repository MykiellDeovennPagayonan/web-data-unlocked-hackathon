import { PrismaService } from '../../../../prisma/prisma.service';
import { RegistryEntry } from '../../registry-entries/entities/registry-entry.entity';
import { EntityLookupFilters } from '../entities/registry-target.entity';

export async function findEntriesByEntity(
  prisma: PrismaService,
  filters: EntityLookupFilters,
): Promise<RegistryEntry[]> {
  const targets = await prisma.registryTarget.findMany({
    where: {
      targetType: filters.targetType,
      identityId: filters.identityId,
      orgId: filters.orgId,
      ipId: filters.ipId,
      deviceId: filters.deviceId,
      emailHash: filters.emailHash,
    },
    include: {
      registryEntry: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return targets.map((t) => t.registryEntry);
}
