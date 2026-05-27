import { IsEnum, IsString } from 'class-validator';
import { VerificationType } from '../../../../generated/client';

export class CreateVerificationRequestDto {
  @IsString()
  identityId!: string;

  @IsString()
  platformId!: string;

  @IsEnum(VerificationType)
  verificationType!: VerificationType;

  @IsString()
  provider!: string;
}
