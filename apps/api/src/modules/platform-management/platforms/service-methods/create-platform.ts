import { PlatformsRepository } from '../platforms.repository';
import { CreatePlatformData, Platform } from '../entities/platform.entity';

export function createPlatform(
  repository: PlatformsRepository,
  input: CreatePlatformData,
): Promise<Platform> {
  return repository.insert(input);
}
