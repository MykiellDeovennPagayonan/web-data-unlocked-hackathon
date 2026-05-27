import { IsEnum } from 'class-validator';
import { CheckVerdict } from '../../../../generated/client';

export class CompleteBackgroundCheckDto {
  @IsEnum(CheckVerdict)
  overallVerdict!: CheckVerdict;
}
