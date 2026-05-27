import { PrismaService } from '../../../../prisma/prisma.service';
import { Device } from '../entities/device.entity';

export async function findDeviceById(
  prisma: PrismaService,
  id: string,
): Promise<Device | null> {
  return prisma.device.findUnique({ where: { id } });
}
