import { BackgroundChecksRepository } from '../background-checks.repository';
import {
  BackgroundCheck,
  CreateBackgroundCheckData,
} from '../entities/background-check.entity';

export async function createBackgroundCheck(
  repository: BackgroundChecksRepository,
  input: CreateBackgroundCheckData,
): Promise<BackgroundCheck> {
  return repository.insert(input);
}
