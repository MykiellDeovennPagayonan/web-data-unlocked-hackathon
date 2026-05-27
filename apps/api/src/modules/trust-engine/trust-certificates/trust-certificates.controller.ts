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
import { TrustCertificatesService } from './trust-certificates.service';
import { IssueCertificateDto } from './dto/issue-certificate.dto';
import { RevokeCertificateDto } from './dto/revoke-certificate.dto';
import { TrustCertificate } from './entities/trust-certificate.entity';
import { EntityType } from '../../../generated/client';

@Controller()
export class TrustCertificatesController {
  constructor(
    private readonly trustCertificatesService: TrustCertificatesService,
  ) {}

  @Post('v1/trust-certificates')
  @UseGuards(ApiKeyGuard)
  issue(@Body() dto: IssueCertificateDto): Promise<TrustCertificate> {
    return this.trustCertificatesService.issueCertificate({
      entityType: dto.entityType,
      identityId: dto.identityId,
      orgId: dto.orgId,
      issuingCheckId: dto.issuingCheckId,
      validDays: dto.validDays,
    });
  }

  @Patch('v1/trust-certificates/:id/revoke')
  @UseGuards(ApiKeyGuard)
  revoke(
    @Param('id') id: string,
    @Body() dto: RevokeCertificateDto,
  ): Promise<TrustCertificate> {
    return this.trustCertificatesService.revokeCertificate(id, dto.reason);
  }

  @Get('v1/trust-certificates')
  @UseGuards(ApiKeyGuard)
  list(
    @Query('entityType') entityType: EntityType,
    @Query('entityId') entityId: string,
  ): Promise<TrustCertificate[]> {
    return this.trustCertificatesService.getCertificatesByEntity(
      entityType,
      entityId,
    );
  }
}
