import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TargetType } from '../../../../generated/client';

export class CreateRegistryTargetDto {
  @IsString()
  registryEntryId!: string;

  @IsEnum(TargetType)
  targetType!: TargetType;

  @IsOptional()
  @IsString()
  identityId?: string;

  @IsOptional()
  @IsString()
  orgId?: string;

  @IsOptional()
  @IsString()
  ipId?: string;

  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsOptional()
  @IsString()
  emailHash?: string;
}
