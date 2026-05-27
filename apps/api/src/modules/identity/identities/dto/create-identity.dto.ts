import { IsString, IsOptional, IsEnum } from 'class-validator';
import { TrustStatus } from '../../../../generated/client';

export class CreateIdentityDto {
  @IsString()
  emailHash!: string;

  @IsString()
  encryptedEmail!: string;

  @IsString()
  encryptedFullName!: string;

  @IsOptional()
  @IsEnum(TrustStatus)
  trustStatus?: TrustStatus;
}
