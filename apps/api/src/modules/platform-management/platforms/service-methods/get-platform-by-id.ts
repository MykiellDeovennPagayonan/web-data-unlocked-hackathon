import { PlatformsRepository } from '../platforms.repository';
import { Platform } from '../entities/platform.entity';

export function getPlatformById(
  repository: PlatformsRepository,
  id: string,
): Promise<Platform | null> {
  return repository.findById(id);
}
