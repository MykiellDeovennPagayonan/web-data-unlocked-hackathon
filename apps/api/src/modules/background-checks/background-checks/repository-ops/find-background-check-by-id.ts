import { PrismaService } from '../../../../prisma/prisma.service';
import { BackgroundCheck } from '../entities/background-check.entity';

export async function findBackgroundCheckById(
  prisma: PrismaService,
  id: string,
): Promise<BackgroundCheck | null> {
  return prisma.backgroundCheck.findUnique({
    where: { id },
    include: { results: true },
  });
}
