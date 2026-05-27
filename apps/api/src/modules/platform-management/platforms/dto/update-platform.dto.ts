import { IsString, IsEnum, IsOptional } from 'class-validator';
import { PlatformStatus, StrictnessLevel } from '../../../../generated/client';

export class UpdatePlatformDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @IsEnum(PlatformStatus)
  status?: PlatformStatus;

  @IsOptional()
  @IsEnum(StrictnessLevel)
  strictnessLevel?: StrictnessLevel;
}
