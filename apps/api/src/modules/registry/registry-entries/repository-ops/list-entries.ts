import { PrismaService } from '../../../../prisma/prisma.service';
import {
  RegistryEntry,
  RegistryEntryFilters,
} from '../entities/registry-entry.entity';

export async function listEntries(
  prisma: PrismaService,
  filters: RegistryEntryFilters,
): Promise<RegistryEntry[]> {
  return prisma.registryEntry.findMany({
    where: {
      listType: filters.listType,
      severity: filters.severity,
      sourceType: filters.sourceType,
      isActive: filters.isActive,
    },
    include: { targets: true },
    take: filters.limit ?? 50,
    skip: filters.offset ?? 0,
    orderBy: { createdAt: 'desc' },
  });
}
