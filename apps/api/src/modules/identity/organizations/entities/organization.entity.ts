import {
  Organization as PrismaOrganization,
  TrustStatus,
} from '../../../../../generated/prisma/client';

export type Organization = PrismaOrganization;

export interface CreateOrganizationData {
  legalName: string;
  domain: string;
  registrationNumber: string;
  country: string;
  industry: string;
  trustStatus?: TrustStatus;
  submittedByPlatformId: string;
}

export interface UpdateOrganizationData {
  legalName?: string;
  domain?: string;
  trustStatus?: TrustStatus;
}
