import { IsEnum, IsOptional, IsBoolean, IsString } from 'class-validator';
import { TrustStatus } from '../../../../../generated/prisma/client';

export class UpdateIdentityStatusDto {
  @IsOptional()
  @IsEnum(TrustStatus)
  trustStatus?: TrustStatus;

  @IsOptional()
  @IsBoolean()
  isHumanVerified?: boolean;

  @IsOptional()
  @IsString()
  certificateId?: string;
}
