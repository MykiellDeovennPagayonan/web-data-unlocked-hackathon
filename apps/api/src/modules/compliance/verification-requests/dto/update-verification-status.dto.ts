import { IsEnum, IsOptional, IsString } from 'class-validator';
import { VerificationStatus } from '../../../../generated/client';

export class UpdateVerificationStatusDto {
  @IsEnum(VerificationStatus)
  status!: VerificationStatus;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
