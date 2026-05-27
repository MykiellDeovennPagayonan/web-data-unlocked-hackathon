import { IsString, IsEnum } from 'class-validator';
import { AliasType } from '../../../../generated/client';

export class ResolveAliasDto {
  @IsEnum(AliasType)
  aliasType!: AliasType;

  @IsString()
  aliasValueHash!: string;
}
