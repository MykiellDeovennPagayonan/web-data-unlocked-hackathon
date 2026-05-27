import { PrismaService } from '../../../../prisma/prisma.service';
import { Device, UpdateDeviceData } from '../entities/device.entity';

export async function updateDevice(
  prisma: PrismaService,
  id: string,
  data: UpdateDeviceData,
): Promise<Device> {
  return prisma.device.update({
    where: { id },
    data: {
      ...(data.riskScore !== undefined && { riskScore: data.riskScore }),
      ...(data.isFlagged !== undefined && { isFlagged: data.isFlagged }),
    },
  });
}
