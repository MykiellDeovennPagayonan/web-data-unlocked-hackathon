import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import {
  EntityType,
  SignalType,
  SignalSource,
} from '../../../../generated/client';

export class CreateTrustSignalDto {
  @IsEnum(EntityType)
  entityType!: EntityType;

  @IsOptional()
  @IsString()
  identityId?: string;

  @IsOptional()
  @IsString()
  orgId?: string;

  @IsEnum(SignalType)
  signalType!: SignalType;

  @IsNumber()
  weight!: number;

  @IsEnum(SignalSource)
  source!: SignalSource;

  @IsString()
  referenceId!: string;

  @IsOptional()
  @IsString()
  expiresAt?: string;
}
