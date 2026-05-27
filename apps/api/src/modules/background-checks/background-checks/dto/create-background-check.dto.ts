import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EntityType, CheckTrigger } from '../../../../generated/client';

export class CreateBackgroundCheckDto {
  @IsEnum(EntityType)
  entityType!: EntityType;

  @IsOptional()
  @IsString()
  identityId?: string;

  @IsOptional()
  @IsString()
  orgId?: string;

  @IsEnum(CheckTrigger)
  triggeredBy!: CheckTrigger;
}
