import { AccessEventsRepository } from '../access-events.repository';
import {
  AccessEvent,
  CreateAccessEventData,
} from '../entities/access-event.entity';

export async function recordAccessEvent(
  repository: AccessEventsRepository,
  data: CreateAccessEventData,
): Promise<AccessEvent> {
  return repository.insert(data);
}
