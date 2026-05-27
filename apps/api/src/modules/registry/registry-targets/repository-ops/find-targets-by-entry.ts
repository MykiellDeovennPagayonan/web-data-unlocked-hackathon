import { PrismaService } from '../../../../prisma/prisma.service';
import { RegistryTarget } from '../entities/registry-target.entity';

export async function findTargetsByEntry(
  prisma: PrismaService,
  registryEntryId: string,
): Promise<RegistryTarget[]> {
  return prisma.registryTarget.findMany({
    where: { registryEntryId },
    orderBy: { createdAt: 'desc' },
  });
}
