import { IsEnum } from 'class-validator';
import { StrictnessLevel } from '../../../../generated/client';

export class ApplyPresetRulesDto {
  @IsEnum(StrictnessLevel)
  strictnessLevel!: StrictnessLevel;
}
