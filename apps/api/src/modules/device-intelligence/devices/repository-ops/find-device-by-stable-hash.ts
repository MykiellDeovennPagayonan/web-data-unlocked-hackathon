import { PrismaService } from '../../../../prisma/prisma.service';
import { Device } from '../entities/device.entity';

export async function findDeviceByStableHash(
  prisma: PrismaService,
  stableHash: string,
): Promise<Device | null> {
  return prisma.device.findFirst({ where: { stableHash } });
}
