import { IsString, IsOptional, IsEnum, IsEmail } from 'class-validator';
import { TrustStatus } from '../../../../generated/client';

export class CreateIdentityDto {
  @IsEmail()
  email!: string;

  @IsString()
  encryptedEmail!: string;

  @IsString()
  encryptedFullName!: string;

  @IsOptional()
  @IsEnum(TrustStatus)
  trustStatus?: TrustStatus;

  @IsOptional()
  @IsString()
  submittedByPlatformId?: string;
}
