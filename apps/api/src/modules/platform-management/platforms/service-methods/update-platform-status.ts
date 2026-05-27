import { PlatformStatus } from '../../../../generated/enums';
import { PlatformsRepository } from '../platforms.repository';
import { Platform } from '../entities/platform.entity';

export function updatePlatformStatus(
  repository: PlatformsRepository,
  id: string,
  status: PlatformStatus,
): Promise<Platform> {
  return repository.update(id, { status });
}
