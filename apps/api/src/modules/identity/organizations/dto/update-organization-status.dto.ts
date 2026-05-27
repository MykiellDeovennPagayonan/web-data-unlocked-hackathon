import { IsEnum } from 'class-validator';
import { TrustStatus } from '../../../../generated/client';

export class UpdateOrganizationStatusDto {
  @IsEnum(TrustStatus)
  trustStatus!: TrustStatus;
}
