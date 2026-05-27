import { ApiKey as PrismaApiKey } from '../../../../generated/client';

export type ApiKey = PrismaApiKey;

export interface CreateApiKeyData {
  platformId: string;
  name: string;
  scopes: string[];
  expiresAt?: Date;
}

export interface UpdateApiKeyData {
  keyHash?: string;
  lastUsedAt?: Date;
  revokedAt?: Date;
}

export interface ApiKeyFilters {
  platformId: string;
  isActive?: boolean;
}
