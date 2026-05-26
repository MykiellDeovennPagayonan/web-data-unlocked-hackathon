import { IsString, IsEnum } from 'class-validator';
import { AliasType } from '../../../../../generated/prisma/client';

export class ResolveAliasDto {
  @IsEnum(AliasType)
  aliasType!: AliasType;

  @IsString()
  aliasValueHash!: string;
}
