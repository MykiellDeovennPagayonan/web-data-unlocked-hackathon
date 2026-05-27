import { PrismaService } from '../../../../prisma/prisma.service';
import {
  RegistryTarget,
  CreateRegistryTargetData,
} from '../entities/registry-target.entity';

export async function insertTarget(
  prisma: PrismaService,
  data: CreateRegistryTargetData,
): Promise<RegistryTarget> {
  return prisma.registryTarget.create({
    data: {
      registryEntryId: data.registryEntryId,
      targetType: data.targetType,
      identityId: data.identityId,
      orgId: data.orgId,
      ipId: data.ipId,
      deviceId: data.deviceId,
      emailHash: data.emailHash,
    },
  });
}
