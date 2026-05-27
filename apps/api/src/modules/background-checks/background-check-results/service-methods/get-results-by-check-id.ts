import { BackgroundCheckResultsRepository } from '../background-check-results.repository';
import { BackgroundCheckResult } from '../entities/background-check-result.entity';

export async function getResultsByCheckId(
  repository: BackgroundCheckResultsRepository,
  checkId: string,
): Promise<BackgroundCheckResult[]> {
  return repository.findByCheckId(checkId);
}
