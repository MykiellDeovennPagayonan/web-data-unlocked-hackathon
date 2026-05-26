import { IsEnum, IsObject, IsBoolean, IsOptional } from 'class-validator';
import {
  RuleTrigger,
  RuleAction,
} from '../../../../../generated/prisma/client';

export class UpdatePlatformRuleDto {
  @IsOptional()
  @IsEnum(RuleTrigger)
  ruleTrigger?: RuleTrigger;

  @IsOptional()
  @IsObject()
  conditionJson?: object;

  @IsOptional()
  @IsEnum(RuleAction)
  action?: RuleAction;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
