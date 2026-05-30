import { PrismaService } from '../../../../prisma/prisma.service';
import { TrustCertificate } from '../entities/trust-certificate.entity';

export async function findCertificateByHash(
  prisma: PrismaService,
  hash: string,
): Promise<TrustCertificate | null> {
  return prisma.trustCertificate.findUnique({
    where: { certificateHash: hash },
    include: {
      identity: true,
      org: true,
    },
  });
}
