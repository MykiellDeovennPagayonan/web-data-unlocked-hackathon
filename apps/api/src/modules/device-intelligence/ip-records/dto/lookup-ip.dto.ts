import { IsIP, IsNotEmpty, IsString } from 'class-validator';

export class LookupIpDto {
  @IsString()
  @IsNotEmpty()
  @IsIP()
  ipAddress!: string;
}
