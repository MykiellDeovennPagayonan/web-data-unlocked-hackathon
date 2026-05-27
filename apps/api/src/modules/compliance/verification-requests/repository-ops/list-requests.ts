import { PrismaService } from '../../../../prisma/prisma.service';
import {
  VerificationRequest,
  VerificationRequestFilters,
} from '../entities/verification-request.entity';

export async function listRequests(
  prisma: PrismaService,
  filters: VerificationRequestFilters,
): Promise<VerificationRequest[]> {
  return prisma.verificationRequest.findMany({
    where: {
      identityId: filters.identityId,
      platformId: filters.platformId,
      status: filters.status,
      verificationType: filters.verificationType,
    },
    take: filters.limit ?? 50,
    skip: filters.offset ?? 0,
    orderBy: { createdAt: 'desc' },
  });
}
