import { IsOptional, IsEnum } from 'class-validator';
import { PlatformUserStatus } from '../../../../../generated/prisma/client';

export class UpdatePlatformUserStatusDto {
  @IsOptional()
  @IsEnum(PlatformUserStatus)
  statusOnPlatform?: PlatformUserStatus;
}
