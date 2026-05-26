import { PlatformsRepository } from '../platforms.repository';
import { Platform, UpdatePlatformData } from '../entities/platform.entity';

export function updatePlatform(
  repository: PlatformsRepository,
  id: string,
  input: UpdatePlatformData,
): Promise<Platform> {
  return repository.update(id, input);
}
