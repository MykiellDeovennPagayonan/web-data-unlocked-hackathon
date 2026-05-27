import {
  BackgroundCheck as PrismaBackgroundCheck,
  EntityType,
  CheckTrigger,
  CheckVerdict,
} from '../../../../generated/client';

export type BackgroundCheck = PrismaBackgroundCheck;

export interface CreateBackgroundCheckData {
  entityType: EntityType;
  identityId?: string;
  orgId?: string;
  triggeredBy: CheckTrigger;
  overallVerdict?: CheckVerdict;
}

export interface UpdateBackgroundCheckData {
  overallVerdict?: CheckVerdict;
  completedAt?: Date;
}

export interface BackgroundCheckFilters {
  entityType?: EntityType;
  identityId?: string;
  orgId?: string;
  triggeredBy?: CheckTrigger;
  overallVerdict?: CheckVerdict;
  limit?: number;
  offset?: number;
}
