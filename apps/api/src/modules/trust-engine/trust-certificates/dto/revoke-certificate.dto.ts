import { IsString } from 'class-validator';

export class RevokeCertificateDto {
  @IsString()
  reason!: string;
}
