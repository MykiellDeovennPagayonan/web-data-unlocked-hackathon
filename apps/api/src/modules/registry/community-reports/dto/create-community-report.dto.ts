import {
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
  IsEmail,
} from 'class-validator';
import {
  TargetType,
  ReportSeverity,
  ReportCategory,
} from '../../../../generated/client';

export class CreateCommunityReportDto {
  @IsString()
  reportingPlatformId!: string;

  @IsEnum(TargetType)
  targetType!: TargetType;

  @IsOptional()
  @IsString()
  identityId?: string;

  @IsOptional()
  @IsString()
  orgId?: string;

  @IsOptional()
  @IsString()
  ipId?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsEnum(ReportSeverity)
  severity!: ReportSeverity;

  @IsEnum(ReportCategory)
  category!: ReportCategory;

  @IsString()
  description!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evidenceUrls?: string[];
}
