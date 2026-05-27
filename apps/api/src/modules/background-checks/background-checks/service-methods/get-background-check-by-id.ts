import { BackgroundChecksRepository } from '../background-checks.repository';
import { BackgroundCheck } from '../entities/background-check.entity';

export async function getBackgroundCheckById(
  repository: BackgroundChecksRepository,
  id: string,
): Promise<BackgroundCheck | null> {
  return repository.findById(id);
}
