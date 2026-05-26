import { PlatformUsersRepository } from '../platform-users.repository';
import {
  CreatePlatformUserData,
  PlatformUser,
} from '../entities/platform-user.entity';

export async function createPlatformUser(
  repository: PlatformUsersRepository,
  input: CreatePlatformUserData,
): Promise<PlatformUser> {
  const existing = await repository.findByExternalId(
    input.platformId,
    input.externalUserId,
  );
  if (existing) {
    throw new Error('Platform user already exists');
  }
  return repository.insert(input);
}
