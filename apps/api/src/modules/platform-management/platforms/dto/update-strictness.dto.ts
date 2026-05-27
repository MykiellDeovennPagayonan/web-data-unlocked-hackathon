import { IsEnum } from 'class-validator';
import { StrictnessLevel } from '../../../../generated/client';

export class UpdateStrictnessDto {
  @IsEnum(StrictnessLevel)
  strictnessLevel!: StrictnessLevel;
}
