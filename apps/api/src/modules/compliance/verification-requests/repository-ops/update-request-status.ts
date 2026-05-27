import { PrismaService } from '../../../../prisma/prisma.service';
import {
  VerificationRequest,
  UpdateVerificationRequestStatusData,
} from '../entities/verification-request.entity';

export async function updateRequestStatus(
  prisma: PrismaService,
  id: string,
  data: UpdateVerificationRequestStatusData,
): Promise<VerificationRequest> {
  return prisma.verificationRequest.update({
    where: { id },
    data,
  });
}
