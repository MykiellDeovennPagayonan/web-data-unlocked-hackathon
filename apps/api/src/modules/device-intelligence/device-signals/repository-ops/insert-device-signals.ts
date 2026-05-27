import { PrismaService } from '../../../../prisma/prisma.service';
import {
  CreateDeviceSignalData,
  DeviceSignal,
} from '../entities/device-signal.entity';

export async function insertDeviceSignals(
  prisma: PrismaService,
  signals: CreateDeviceSignalData[],
): Promise<DeviceSignal[]> {
  await prisma.deviceSignal.createMany({ data: signals });
  return prisma.deviceSignal.findMany({
    where: { deviceId: signals[0]?.deviceId },
    orderBy: { recordedAt: 'desc' },
    take: signals.length,
  });
}
