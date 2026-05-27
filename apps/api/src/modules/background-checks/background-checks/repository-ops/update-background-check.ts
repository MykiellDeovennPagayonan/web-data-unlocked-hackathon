import { PrismaService } from '../../../../prisma/prisma.service';
import {
  BackgroundCheck,
  UpdateBackgroundCheckData,
} from '../entities/background-check.entity';

export async function updateBackgroundCheck(
  prisma: PrismaService,
  id: string,
  data: UpdateBackgroundCheckData,
): Promise<BackgroundCheck> {
  return prisma.backgroundCheck.update({
    where: { id },
    data,
  });
}
