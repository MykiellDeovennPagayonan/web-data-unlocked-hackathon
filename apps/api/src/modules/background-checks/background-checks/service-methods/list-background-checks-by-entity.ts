import { BackgroundChecksRepository } from '../background-checks.repository';
import {
  BackgroundCheck,
  BackgroundCheckFilters,
} from '../entities/background-check.entity';

export async function listBackgroundChecksByEntity(
  repository: BackgroundChecksRepository,
  filters: BackgroundCheckFilters,
): Promise<BackgroundCheck[]> {
  return repository.listByEntity(filters);
}
