import { PlatformsRepository } from '../platforms.repository';
import { Platform } from '../entities/platform.entity';

export function getPlatformByDomain(
  repository: PlatformsRepository,
  domain: string,
): Promise<Platform | null> {
  return repository.findByDomain(domain);
}
