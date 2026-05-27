import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { EntityType, SnapshotReason } from '../../../../generated/client';

export class CreateSnapshotDto {
  @IsEnum(EntityType)
  entityType!: EntityType;

  @IsOptional()
  @IsString()
  identityId?: string;

  @IsOptional()
  @IsString()
  orgId?: string;

  @IsNumber()
  score!: number;

  @IsEnum(SnapshotReason)
  snapshotReason!: SnapshotReason;

  @IsString()
  referenceId!: string;
}
