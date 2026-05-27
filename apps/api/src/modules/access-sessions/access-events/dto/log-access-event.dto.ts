import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { AccessEventType, AccessVerdict } from '../../../../generated/client';

export class LogAccessEventDto {
  @IsUUID()
  platformId!: string;

  @IsUUID()
  @IsOptional()
  identityId?: string;

  @IsUUID()
  @IsOptional()
  orgId?: string;

  @IsUUID()
  ipId!: string;

  @IsUUID()
  deviceId!: string;

  @IsEnum(AccessEventType)
  eventType!: AccessEventType;

  @IsEnum(AccessVerdict)
  verdict!: AccessVerdict;

  @IsNumber()
  scoreAtEvent!: number;

  @IsObject()
  @IsOptional()
  triggeredRules?: Record<string, unknown>;
}
