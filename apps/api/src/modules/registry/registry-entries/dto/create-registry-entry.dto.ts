import { IsEnum } from 'class-validator';
import {
  ListType,
  RegistrySeverity,
  RegistrySourceType,
} from '../../../../generated/client';

export class CreateRegistryEntryDto {
  @IsEnum(ListType)
  listType!: ListType;

  @IsEnum(RegistrySeverity)
  severity!: RegistrySeverity;

  @IsEnum(RegistrySourceType)
  sourceType!: RegistrySourceType;
}
