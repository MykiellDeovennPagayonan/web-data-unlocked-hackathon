import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AccessEventType } from '../../../../generated/client';

export class PlatformRuleDto {
  @IsUUID()
  id!: string;

  @IsString()
  @IsNotEmpty()
  ruleTrigger!: string;

  conditionJson!: Record<string, unknown>;

  @IsString()
  @IsNotEmpty()
  action!: string;

  isActive!: boolean;
}

export class EvaluateAccessDto {
  @IsUUID()
  platformId!: string;

  @IsUUID()
  @IsOptional()
  identityId?: string;

  @IsUUID()
  ipRecordId!: string;

  @IsUUID()
  deviceId!: string;

  @IsEnum(AccessEventType)
  eventType!: AccessEventType;

  @IsOptional()
  @IsNumber()
  trustScore?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlatformRuleDto)
  platformRules!: PlatformRuleDto[];
}
