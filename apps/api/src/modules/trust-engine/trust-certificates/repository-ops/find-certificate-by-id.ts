import { PrismaService } from '../../../../prisma/prisma.service';
import { TrustCertificate } from '../entities/trust-certificate.entity';

export async function findCertificateById(
  prisma: PrismaService,
  id: string,
): Promise<TrustCertificate | null> {
  return prisma.trustCertificate.findUnique({ where: { id } });
}
