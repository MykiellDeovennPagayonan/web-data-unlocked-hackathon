import { BackgroundCheckResultsRepository } from '../background-check-results.repository';
import {
  BackgroundCheckResult,
  CreateBackgroundCheckResultData,
} from '../entities/background-check-result.entity';

export async function addCheckResult(
  repository: BackgroundCheckResultsRepository,
  input: CreateBackgroundCheckResultData,
): Promise<BackgroundCheckResult> {
  return repository.insert(input);
}
