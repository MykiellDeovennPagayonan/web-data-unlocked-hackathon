import { AccessEventsRepository } from '../access-events.repository';
import { AccessEvent } from '../entities/access-event.entity';

export async function getPlatformEvents(
  repository: AccessEventsRepository,
  platformId: string,
  take?: number,
): Promise<AccessEvent[]> {
  return repository.findByPlatform(platformId, take);
}
