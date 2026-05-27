import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateDeviceData, Device } from '../entities/device.entity';

export async function insertDevice(
  prisma: PrismaService,
  data: CreateDeviceData,
): Promise<Device> {
  return prisma.device.create({
    data: {
      stableHash: data.stableHash,
      riskScore: data.riskScore ?? 0,
      isFlagged: data.isFlagged ?? false,
    },
  });
}
