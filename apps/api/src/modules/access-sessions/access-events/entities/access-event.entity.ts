import {
  AccessEvent as PrismaAccessEvent,
  AccessEventType,
  AccessVerdict,
} from '../../../../generated/client';

export type AccessEvent = PrismaAccessEvent;

export interface CreateAccessEventData {
  platformId: string;
  identityId?: string;
  orgId?: string;
  ipId: string;
  deviceId?: string;
  eventType: AccessEventType;
  verdict: AccessVerdict;
  scoreAtEvent: number;
  triggeredRules: object;
}
