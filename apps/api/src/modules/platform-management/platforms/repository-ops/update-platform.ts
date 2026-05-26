import { PrismaService } from '../../../../prisma/prisma.service';
import { Platform, UpdatePlatformData } from '../entities/platform.entity';

export function updatePlatform(
  prisma: PrismaService,
  id: string,
  data: UpdatePlatformData,
): Promise<Platform> {
  return prisma.platform.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.domain && { domain: data.domain }),
      ...(data.status && { status: data.status }),
      ...(data.strictnessLevel && { strictnessLevel: data.strictnessLevel }),
    },
  });
}
