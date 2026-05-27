import { IsString, IsOptional, IsEnum } from 'class-validator';
import { PlatformUserStatus } from '../../../../generated/client';

export class CreatePlatformUserDto {
  @IsString()
  identityId!: string;

  @IsString()
  platformId!: string;

  @IsString()
  externalUserId!: string;

  @IsOptional()
  @IsEnum(PlatformUserStatus)
  statusOnPlatform?: PlatformUserStatus;
}
