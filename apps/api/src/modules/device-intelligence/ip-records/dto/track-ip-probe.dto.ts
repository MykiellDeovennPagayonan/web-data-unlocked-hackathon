import { IsIP, IsNotEmpty, IsString } from 'class-validator';

export class TrackIpProbeDto {
  @IsString()
  @IsNotEmpty()
  @IsIP()
  ipAddress!: string;

  @IsString()
  @IsNotEmpty()
  endpointSignature!: string;
}
