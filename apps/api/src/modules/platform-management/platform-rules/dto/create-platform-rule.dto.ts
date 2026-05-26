import { IsString, IsEnum, IsObject, IsOptional } from 'class-validator';
import {
  RuleTrigger,
  RuleAction,
} from '../../../../../generated/prisma/client';

export class CreatePlatformRuleDto {
  @IsEnum(RuleTrigger)
  ruleTrigger!: RuleTrigger;

  @IsObject()
  conditionJson!: object;

  @IsEnum(RuleAction)
  action!: RuleAction;

  @IsOptional()
  @IsString()
  platformId?: string;
}
