import { PrismaService } from '../../../../prisma/prisma.service';
import {
  VerificationRequest,
  CreateVerificationRequestData,
} from '../entities/verification-request.entity';
import { VerificationStatus } from '../../../../generated/client';

export async function insertRequest(
  prisma: PrismaService,
  data: CreateVerificationRequestData,
): Promise<VerificationRequest> {
  return prisma.verificationRequest.create({
    data: {
      identityId: data.identityId,
      platformId: data.platformId,
      verificationType: data.verificationType,
      provider: data.provider,
      status: VerificationStatus.pending,
    },
  });
}
