import { PrismaService } from '../../../../prisma/prisma.service';
import { DeviceSignal } from '../entities/device-signal.entity';

export async function findSignalsByDevice(
  prisma: PrismaService,
  deviceId: string,
): Promise<DeviceSignal[]> {
  return prisma.deviceSignal.findMany({
    where: { deviceId },
    orderBy: { recordedAt: 'desc' },
  });
}
