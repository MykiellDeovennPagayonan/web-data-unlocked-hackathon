import { PrismaService } from '../../../../prisma/prisma.service';
import {
  CertificateVerification,
  CreateCertificateVerificationData,
} from '../entities/certificate-verification.entity';

export async function insertVerification(
  prisma: PrismaService,
  data: CreateCertificateVerificationData,
): Promise<CertificateVerification> {
  return prisma.certificateVerification.create({
    data: {
      certificateId: data.certificateId,
      verifiedByPlatformId: data.verifiedByPlatformId,
      verdict: data.verdict,
    },
  });
}
