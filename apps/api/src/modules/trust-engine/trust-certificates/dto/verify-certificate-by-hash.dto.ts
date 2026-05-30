import { IsString } from 'class-validator';

export class VerifyCertificateByHashDto {
  @IsString()
  certificateHash!: string;

  @IsString()
  verifiedByPlatformId!: string;
}
