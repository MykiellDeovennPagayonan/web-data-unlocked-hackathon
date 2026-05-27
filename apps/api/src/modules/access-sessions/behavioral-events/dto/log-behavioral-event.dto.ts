import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  BehavioralEventType,
  BehavioralActionTaken,
} from '../../../../generated/client';

export class LogBehavioralEventDto {
  @IsUUID()
  sessionId!: string;

  @IsUUID()
  identityId!: string;

  @IsUUID()
  platformId!: string;

  @IsEnum(BehavioralEventType)
  eventType!: BehavioralEventType;

  @IsString()
  @IsNotEmpty()
  endpoint!: string;

  @IsBoolean()
  flagTriggered!: boolean;

  @IsString()
  @IsOptional()
  flagType?: string;

  @IsEnum(BehavioralActionTaken)
  actionTaken!: BehavioralActionTaken;
}
