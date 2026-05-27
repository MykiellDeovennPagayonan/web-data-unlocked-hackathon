import { VerificationRequestsRepository } from '../verification-requests.repository';
import {
  VerificationRequest,
  VerificationRequestFilters,
} from '../entities/verification-request.entity';

export async function listRequests(
  repository: VerificationRequestsRepository,
  filters: VerificationRequestFilters,
): Promise<VerificationRequest[]> {
  return repository.list(filters);
}
