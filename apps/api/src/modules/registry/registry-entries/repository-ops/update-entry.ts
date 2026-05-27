import { PrismaService } from '../../../../prisma/prisma.service';
import {
  RegistryEntry,
  UpdateRegistryEntryData,
} from '../entities/registry-entry.entity';

export async function updateEntry(
  prisma: PrismaService,
  id: string,
  data: UpdateRegistryEntryData,
): Promise<RegistryEntry> {
  return prisma.registryEntry.update({
    where: { id },
    data,
  });
}
