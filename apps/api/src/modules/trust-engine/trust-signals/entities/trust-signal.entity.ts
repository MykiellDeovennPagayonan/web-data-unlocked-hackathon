import {
  TrustSignal as PrismaTrustSignal,
  EntityType,
  SignalType,
  SignalSource,
} from '../../../../generated/client';

export type TrustSignal = PrismaTrustSignal;

export interface CreateTrustSignalData {
  entityType: EntityType;
  identityId?: string;
  orgId?: string;
  signalType: SignalType;
  weight: number;
  source: SignalSource;
  referenceId: string;
  expiresAt?: Date;
}

export interface TrustSignalFilters {
  entityType?: EntityType;
  identityId?: string;
  orgId?: string;
  signalType?: SignalType;
  source?: SignalSource;
}
