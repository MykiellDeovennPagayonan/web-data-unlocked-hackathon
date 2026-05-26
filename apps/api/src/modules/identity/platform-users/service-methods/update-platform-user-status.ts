import { PlatformUsersRepository } from '../platform-users.repository';
import {
  PlatformUser,
  UpdatePlatformUserData,
} from '../entities/platform-user.entity';

export function updatePlatformUserStatus(
  repository: PlatformUsersRepository,
  id: string,
  status: UpdatePlatformUserData['statusOnPlatform'],
): Promise<PlatformUser> {
  return repository.update(id, { statusOnPlatform: status });
}
