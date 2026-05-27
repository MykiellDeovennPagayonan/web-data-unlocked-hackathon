import {
  IpRecord as PrismaIpRecord,
  IpType,
} from '../../../../generated/client';

export type IpRecord = PrismaIpRecord;

export interface CreateIpRecordData {
  ipAddress: string;
  ipType: IpType;
  country: string;
  region: string;
  asn: string;
  riskScore: number;
  isBlacklisted?: boolean;
  blacklistSource?: string;
  lastEvaluatedAt: Date;
}

export interface UpdateIpRecordData {
  ipType?: IpType;
  country?: string;
  region?: string;
  asn?: string;
  riskScore?: number;
  isBlacklisted?: boolean;
  blacklistSource?: string | null;
  lastEvaluatedAt?: Date;
}

export interface IpClassification {
  ipType: IpType;
  riskScore: number;
  country: string;
  region: string;
  asn: string;
}
