import { IsEnum } from 'class-validator';
import { StrictnessLevel } from '../../../../../generated/prisma/client';

export class ApplyPresetRulesDto {
  @IsEnum(StrictnessLevel)
  strictnessLevel!: StrictnessLevel;
}
