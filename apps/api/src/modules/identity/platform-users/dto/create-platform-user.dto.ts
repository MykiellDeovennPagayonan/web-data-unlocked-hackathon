import { IsString, IsOptional, IsEnum, IsEmail } from 'class-validator';
import { PlatformUserStatus } from '../../../../generated/client';

export class CreatePlatformUserDto {
  @IsOptional()
  @IsString()
  identityId?: string;

  @IsOptional()
  @IsString()
  platformId?: string;

  @IsString()
  externalUserId!: string;

  @IsOptional()
  @IsEnum(PlatformUserStatus)
  statusOnPlatform?: PlatformUserStatus;

  // Identity creation fields (used when identityId not provided)
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  encryptedEmail?: string;

  @IsOptional()
  @IsString()
  encryptedFullName?: string;
}
