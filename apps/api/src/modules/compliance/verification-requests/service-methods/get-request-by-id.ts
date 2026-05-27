import { VerificationRequestsRepository } from '../verification-requests.repository';
import { VerificationRequest } from '../entities/verification-request.entity';

export async function getRequestById(
  repository: VerificationRequestsRepository,
  id: string,
): Promise<VerificationRequest | null> {
  return repository.findById(id);
}
