import { PrismaService } from '../../../../prisma/prisma.service';
import { VerificationRequest } from '../entities/verification-request.entity';

export async function findRequestById(
  prisma: PrismaService,
  id: string,
): Promise<VerificationRequest | null> {
  return prisma.verificationRequest.findUnique({
    where: { id },
  });
}
