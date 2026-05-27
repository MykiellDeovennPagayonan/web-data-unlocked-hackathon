import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiKeyGuard } from '../../../common/guards/api-key.guard';
import { ConsentRecordsService } from './consent-records.service';
import { CreateConsentRecordDto } from './dto/create-consent-record.dto';
import { ConsentRecord } from './entities/consent-record.entity';
import { ConsentType } from '../../../generated/client';

@Controller()
export class ConsentRecordsController {
  constructor(private readonly consentRecordsService: ConsentRecordsService) {}

  @Post('v1/compliance/consent')
  @UseGuards(ApiKeyGuard)
  record(@Body() dto: CreateConsentRecordDto): Promise<ConsentRecord> {
    return this.consentRecordsService.recordConsent({
      identityId: dto.identityId,
      platformId: dto.platformId,
      consentType: dto.consentType,
      consentVersion: dto.consentVersion,
      ipAtConsent: dto.ipAtConsent,
    });
  }

  @Patch('v1/compliance/consent/:id/revoke')
  @UseGuards(ApiKeyGuard)
  revoke(@Param('id') id: string): Promise<ConsentRecord> {
    return this.consentRecordsService.revokeConsent(id);
  }

  @Get('v1/compliance/consent')
  @UseGuards(ApiKeyGuard)
  list(
    @Query('identityId') identityId?: string,
    @Query('platformId') platformId?: string,
    @Query('consentType') consentType?: ConsentType,
  ): Promise<ConsentRecord[]> {
    return this.consentRecordsService.listConsentByIdentity({
      identityId,
      platformId,
      consentType,
    });
  }

  @Get('v1/compliance/consent/check')
  @UseGuards(ApiKeyGuard)
  checkActive(
    @Query('identityId') identityId: string,
    @Query('platformId') platformId: string,
    @Query('consentType') consentType: ConsentType,
  ): Promise<ConsentRecord | null> {
    return this.consentRecordsService.checkActiveConsent(
      identityId,
      platformId,
      consentType,
    );
  }
}
