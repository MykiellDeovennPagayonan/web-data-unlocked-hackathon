import { BehavioralEventsRepository } from '../behavioral-events.repository';
import { BehavioralEvent } from '../entities/behavioral-event.entity';

export async function getSessionEvents(
  repository: BehavioralEventsRepository,
  sessionId: string,
): Promise<BehavioralEvent[]> {
  return repository.findBySession(sessionId);
}
