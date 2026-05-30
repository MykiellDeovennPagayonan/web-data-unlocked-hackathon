import { PrismaService } from '../../../../prisma/prisma.service';
import { Device } from '../entities/device.entity';

export async function findManyDevices(
  prisma: PrismaService,
  take = 100,
  skip = 0,
): Promise<Device[]> {
  return prisma.device.findMany({
    orderBy: { lastSeenAt: 'desc' },
    take,
    skip,
  });
}
