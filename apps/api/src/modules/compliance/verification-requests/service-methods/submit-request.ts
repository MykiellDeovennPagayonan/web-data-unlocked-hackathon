import { VerificationRequestsRepository } from '../verification-requests.repository';
import { VerificationRequest } from '../entities/verification-request.entity';
import { VerificationStatus } from '../../../../generated/client';

export async function submitRequest(
  repository: VerificationRequestsRepository,
  id: string,
): Promise<VerificationRequest> {
  return repository.updateStatus(id, {
    status: VerificationStatus.submitted,
    submittedAt: new Date(),
  });
}
