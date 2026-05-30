import { PrismaService } from '../../../../prisma/prisma.service';
import { TrustCertificate } from '../entities/trust-certificate.entity';

export async function findManyCertificates(
  prisma: PrismaService,
  take = 100,
  skip = 0,
): Promise<TrustCertificate[]> {
  return prisma.trustCertificate.findMany({
    orderBy: { issuedAt: 'desc' },
    take,
    skip,
    include: {
      identity: { select: { encryptedEmail: true } },
      org: { select: { legalName: true } },
    },
  });
}
