import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DeviceSignalType } from '../../../../generated/client';

export class SignalInputDto {
  @IsEnum(DeviceSignalType)
  signalType!: DeviceSignalType;

  @IsString()
  @IsNotEmpty()
  value!: string;
}

export class ResolveDeviceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SignalInputDto)
  signals!: SignalInputDto[];

  @IsOptional()
  @IsString()
  identityId?: string;
}
