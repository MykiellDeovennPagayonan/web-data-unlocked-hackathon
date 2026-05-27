import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { AuditActorType } from '../../../../generated/client';

export class CreateAuditLogDto {
  @IsEnum(AuditActorType)
  actorType!: AuditActorType;

  @IsString()
  actorId!: string;

  @IsString()
  action!: string;

  @IsString()
  targetType!: string;

  @IsString()
  targetId!: string;

  @IsOptional()
  @IsObject()
  oldValue?: object;

  @IsOptional()
  @IsObject()
  newValue?: object;
}
