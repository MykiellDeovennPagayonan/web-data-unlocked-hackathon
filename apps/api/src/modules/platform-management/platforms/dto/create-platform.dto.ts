import { IsString, IsEnum, IsOptional } from 'class-validator';
import {
  PlatformStatus,
  StrictnessLevel,
} from '../../../../../generated/prisma/client';

export class CreatePlatformDto {
  @IsString()
  name!: string;

  @IsString()
  domain!: string;

  @IsOptional()
  @IsEnum(PlatformStatus)
  status?: PlatformStatus;

  @IsEnum(StrictnessLevel)
  strictnessLevel!: StrictnessLevel;
}
