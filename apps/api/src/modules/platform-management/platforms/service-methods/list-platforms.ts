import { PlatformsRepository } from '../platforms.repository';
import { Platform, PlatformFilters } from '../entities/platform.entity';

export function listPlatforms(
  repository: PlatformsRepository,
  filters: PlatformFilters,
): Promise<Platform[]> {
  return repository.findMany(filters);
}
