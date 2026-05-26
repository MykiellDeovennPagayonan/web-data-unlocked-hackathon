import { StrictnessLevel } from '../../../../../generated/prisma/client';
import { PlatformsRepository } from '../platforms.repository';
import { Platform } from '../entities/platform.entity';

export function updateStrictnessLevel(
  repository: PlatformsRepository,
  id: string,
  strictnessLevel: StrictnessLevel,
): Promise<Platform> {
  return repository.update(id, { strictnessLevel });
}
