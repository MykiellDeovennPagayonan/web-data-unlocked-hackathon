import { IsString, IsOptional, IsEnum } from 'class-validator';
import { TrustStatus } from '../../../../generated/client';

export class SubmitOrganizationDto {
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
}
