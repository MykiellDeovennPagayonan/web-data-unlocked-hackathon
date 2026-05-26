import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateIdentityData, Identity } from '../entities/identity.entity';

export function insertIdentity(
  prisma: PrismaService,
  data: CreateIdentityData,
): Promise<Identity> {
  return prisma.identity.create({
    data: {
      emailHash: data.emailHash,
      encryptedEmail: data.encryptedEmail,
      encryptedFullName: data.encryptedFullName,
      trustStatus: data.trustStatus ?? 'clean',
      isHumanVerified: false,
    },
  });
}
