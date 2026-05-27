import { PrismaService } from '../../../../prisma/prisma.service';
import { CertificateVerification } from '../entities/certificate-verification.entity';

export async function findVerificationsByCertificate(
  prisma: PrismaService,
  certificateId: string,
): Promise<CertificateVerification[]> {
  return prisma.certificateVerification.findMany({
    where: { certificateId },
    orderBy: { verifiedAt: 'desc' },
  });
}
