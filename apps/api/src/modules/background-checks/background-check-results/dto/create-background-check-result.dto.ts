import { IsEnum, IsNumber, IsObject, IsString } from 'class-validator';
import { CheckSource, NormalizedVerdict } from '../../../../generated/client';

export class CreateBackgroundCheckResultDto {
  @IsString()
  checkId!: string;

  @IsEnum(CheckSource)
  source!: CheckSource;

  @IsObject()
  rawResult!: object;

  @IsEnum(NormalizedVerdict)
  normalizedVerdict!: NormalizedVerdict;

  @IsNumber()
  confidenceScore!: number;

  @IsString()
  llmSummary!: string;
}
