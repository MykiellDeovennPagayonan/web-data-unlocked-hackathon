import { PrismaService } from '../../../../prisma/prisma.service';
import { Identity, UpdateIdentityData } from '../entities/identity.entity';

export function updateIdentity(
  prisma: PrismaService,
  id: string,
  data: UpdateIdentityData,
): Promise<Identity> {
  return prisma.identity.update({
    where: { id },
    data: {
      ...(data.trustStatus !== undefined && { trustStatus: data.trustStatus }),
      ...(data.isHumanVerified !== undefined && {
        isHumanVerified: data.isHumanVerified,
      }),
      ...(data.certificateId !== undefined && {
        certificateId: data.certificateId,
      }),
    },
  });
}
