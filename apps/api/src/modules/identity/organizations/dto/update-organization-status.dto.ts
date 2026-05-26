import { IsEnum } from 'class-validator';
import { TrustStatus } from '../../../../../generated/prisma/client';

export class UpdateOrganizationStatusDto {
  @IsEnum(TrustStatus)
  trustStatus!: TrustStatus;
}
