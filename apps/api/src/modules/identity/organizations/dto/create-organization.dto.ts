import { IsString, IsOptional, IsEnum } from 'class-validator';
import { TrustStatus } from '../../../../../generated/prisma/client';

export class CreateOrganizationDto {
  @IsString()
  legalName!: string;

  @IsString()
  domain!: string;

  @IsString()
  registrationNumber!: string;

  @IsString()
  country!: string;

  @IsString()
  industry!: string;

  @IsOptional()
  @IsEnum(TrustStatus)
  trustStatus?: TrustStatus;

  @IsString()
  submittedByPlatformId!: string;
}
