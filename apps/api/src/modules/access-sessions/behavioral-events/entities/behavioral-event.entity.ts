import {
  BehavioralEvent as PrismaBehavioralEvent,
  BehavioralEventType,
  BehavioralActionTaken,
} from '../../../../generated/client';

export type BehavioralEvent = PrismaBehavioralEvent;

export interface CreateBehavioralEventData {
  sessionId: string;
  identityId: string;
  platformId: string;
  eventType: BehavioralEventType;
  endpoint: string;
  flagTriggered: boolean;
  flagType?: string;
  actionTaken: BehavioralActionTaken;
}
