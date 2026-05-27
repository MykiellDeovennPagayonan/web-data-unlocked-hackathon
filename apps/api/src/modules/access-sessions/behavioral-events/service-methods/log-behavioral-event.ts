import { BehavioralEventsRepository } from '../behavioral-events.repository';
import {
  BehavioralEvent,
  CreateBehavioralEventData,
} from '../entities/behavioral-event.entity';

export async function logBehavioralEvent(
  repository: BehavioralEventsRepository,
  data: CreateBehavioralEventData,
): Promise<BehavioralEvent> {
  return repository.insert(data);
}
