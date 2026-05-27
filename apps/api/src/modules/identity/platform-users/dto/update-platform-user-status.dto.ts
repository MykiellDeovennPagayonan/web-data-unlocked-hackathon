import { IsOptional, IsEnum } from 'class-validator';
import { PlatformUserStatus } from '../../../../generated/client';

export class UpdatePlatformUserStatusDto {
  @IsOptional()
  @IsEnum(PlatformUserStatus)
  statusOnPlatform?: PlatformUserStatus;
}
