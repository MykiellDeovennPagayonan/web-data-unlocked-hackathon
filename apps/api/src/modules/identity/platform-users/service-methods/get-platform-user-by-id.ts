import { PlatformUsersRepository } from '../platform-users.repository';
import { PlatformUser } from '../entities/platform-user.entity';

export function getPlatformUserById(
  repository: PlatformUsersRepository,
  id: string,
): Promise<PlatformUser | null> {
  return repository.findById(id);
}
