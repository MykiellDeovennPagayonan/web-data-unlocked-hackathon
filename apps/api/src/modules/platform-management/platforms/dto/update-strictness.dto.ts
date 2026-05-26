import { IsEnum } from 'class-validator';
import { StrictnessLevel } from '../../../../../generated/prisma/client';

export class UpdateStrictnessDto {
  @IsEnum(StrictnessLevel)
  strictnessLevel!: StrictnessLevel;
}
