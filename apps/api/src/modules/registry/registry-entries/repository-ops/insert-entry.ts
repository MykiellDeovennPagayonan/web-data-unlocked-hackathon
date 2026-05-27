import { PrismaService } from '../../../../prisma/prisma.service';
import {
  RegistryEntry,
  CreateRegistryEntryData,
} from '../entities/registry-entry.entity';

export async function insertEntry(
  prisma: PrismaService,
  data: CreateRegistryEntryData,
): Promise<RegistryEntry> {
  return prisma.registryEntry.create({
    data: {
      listType: data.listType,
      severity: data.severity,
      sourceType: data.sourceType,
    },
  });
}
