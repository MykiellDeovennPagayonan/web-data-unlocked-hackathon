import {
  Identity as PrismaIdentity,
  TrustStatus,
} from '../../../../generated/client';

export type Identity = PrismaIdentity;

export interface CreateIdentityData {
  emailHash: string;
  encryptedEmail: string;
  encryptedFullName: string;
  trustStatus?: TrustStatus;
}

export interface UpdateIdentityData {
  trustStatus?: TrustStatus;
  isHumanVerified?: boolean;
  certificateId?: string;
}

export interface IdentityFilters {
  trustStatus?: TrustStatus;
  isHumanVerified?: boolean;
  limit?: number;
  offset?: number;
}
