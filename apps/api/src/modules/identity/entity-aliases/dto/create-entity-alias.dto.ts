import { IsString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import {
  EntityType,
  AliasType,
  AliasSource,
} from '../../../../generated/enums';

export class CreateEntityAliasDto {
  @IsEnum(EntityType)
  canonicalEntityType!: EntityType;

  @IsString()
  canonicalEntityId!: string;

  @IsEnum(AliasType)
  aliasType!: AliasType;

  @IsString()
  aliasValueHash!: string;

  @IsString()
  aliasValueEncrypted!: string;

  @IsNumber()
  confidence!: number;

  @IsEnum(AliasSource)
  source!: AliasSource;

  @IsOptional()
  @IsString()
  identityId?: string;

  @IsOptional()
  @IsString()
  orgId?: string;
}
