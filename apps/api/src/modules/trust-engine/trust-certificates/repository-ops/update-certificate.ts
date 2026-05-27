import { PrismaService } from '../../../../prisma/prisma.service';
import {
  TrustCertificate,
  RevokeCertificateData,
} from '../entities/trust-certificate.entity';

export async function updateCertificate(
  prisma: PrismaService,
  id: string,
  data: RevokeCertificateData,
): Promise<TrustCertificate> {
  return prisma.trustCertificate.update({
    where: { id },
    data,
  });
}
