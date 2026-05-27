import { VerificationRequestsRepository } from '../verification-requests.repository';
import {
  VerificationRequest,
  CreateVerificationRequestData,
} from '../entities/verification-request.entity';

export async function createRequest(
  repository: VerificationRequestsRepository,
  input: CreateVerificationRequestData,
): Promise<VerificationRequest> {
  return repository.insert(input);
}
