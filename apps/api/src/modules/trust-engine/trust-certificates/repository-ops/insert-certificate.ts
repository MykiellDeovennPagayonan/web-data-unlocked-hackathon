import { PrismaService } from '../../../../prisma/prisma.service';
import {
  TrustCertificate,
  CreateTrustCertificateData,
} from '../entities/trust-certificate.entity';

export async function insertCertificate(
  prisma: PrismaService,
  data: CreateTrustCertificateData,
): Promise<TrustCertificate> {
  return prisma.trustCertificate.create({
    data: {
      entityType: data.entityType,
      identityId: data.identityId,
      orgId: data.orgId,
      expiresAt: data.expiresAt,
      status: data.status,
      certificateHash: data.certificateHash,
      blockchainTxHash: data.blockchainTxHash,
      issuingCheckId: data.issuingCheckId,
    },
  });
}
