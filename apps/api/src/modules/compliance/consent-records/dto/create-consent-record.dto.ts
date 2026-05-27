import { IsEnum, IsString } from 'class-validator';
import { ConsentType } from '../../../../generated/client';

export class CreateConsentRecordDto {
  @IsString()
  identityId!: string;

  @IsString()
  platformId!: string;

  @IsEnum(ConsentType)
  consentType!: ConsentType;

  @IsString()
  consentVersion!: string;

  @IsString()
  ipAtConsent!: string;
}
