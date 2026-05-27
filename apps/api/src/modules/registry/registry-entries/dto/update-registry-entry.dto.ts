import { IsEnum, IsOptional, IsInt, IsBoolean } from 'class-validator';
import {
  ListType,
  RegistrySeverity,
  RegistrySourceType,
} from '../../../../generated/client';

export class UpdateRegistryEntryDto {
  @IsOptional()
  @IsEnum(ListType)
  listType?: ListType;

  @IsOptional()
  @IsEnum(RegistrySeverity)
  severity?: RegistrySeverity;

  @IsOptional()
  @IsEnum(RegistrySourceType)
  sourceType?: RegistrySourceType;

  @IsOptional()
  @IsInt()
  reportCount?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
