import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateSessionDto {
  @IsUUID()
  identityId!: string;

  @IsUUID()
  platformId!: string;

  @IsUUID()
  ipId!: string;

  @IsUUID()
  deviceId!: string;

  @IsString()
  @IsNotEmpty()
  sessionTokenHash!: string;

  @IsNumber()
  riskScoreAtStart!: number;
}
