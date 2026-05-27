import {
  Session as PrismaSession,
  SessionVerdict,
} from '../../../../generated/client';

export type Session = PrismaSession;

export interface CreateSessionData {
  identityId: string;
  platformId: string;
  ipId: string;
  deviceId: string;
  sessionTokenHash: string;
  riskScoreAtStart: number;
}

export interface UpdateSessionData {
  riskScoreAtEnd?: number;
  endedAt?: Date;
  sessionVerdict?: SessionVerdict;
  terminationReason?: string;
}
