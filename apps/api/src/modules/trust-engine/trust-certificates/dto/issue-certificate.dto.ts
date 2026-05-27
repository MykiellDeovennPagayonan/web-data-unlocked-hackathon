import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { EntityType } from '../../../../generated/client';

export class IssueCertificateDto {
  @IsEnum(EntityType)
  entityType!: EntityType;

  @IsOptional()
  @IsString()
  identityId?: string;

  @IsOptional()
  @IsString()
  orgId?: string;

  @IsString()
  issuingCheckId!: string;

  @IsOptional()
  @IsNumber()
  validDays?: number;
}
