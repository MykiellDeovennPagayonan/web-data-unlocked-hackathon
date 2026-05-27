import { PrismaService } from '../../../../prisma/prisma.service';
import { RegistryEntry } from '../entities/registry-entry.entity';

export async function findEntryById(
  prisma: PrismaService,
  id: string,
): Promise<RegistryEntry | null> {
  return prisma.registryEntry.findUnique({
    where: { id },
    include: { targets: true },
  });
}
