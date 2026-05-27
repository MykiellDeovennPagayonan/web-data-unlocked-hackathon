import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { SessionVerdict } from '../../../../generated/client';

export class EndSessionDto {
  @IsNumber()
  riskScoreAtEnd!: number;

  @IsEnum(SessionVerdict)
  @IsOptional()
  verdict?: SessionVerdict;

  @IsString()
  @IsOptional()
  terminationReason?: string;
}
