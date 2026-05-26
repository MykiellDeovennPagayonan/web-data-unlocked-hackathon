import { IsString } from 'class-validator';

export class RotateApiKeyDto {
  @IsString()
  name!: string;
}
