import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../../../common/guards/api-key.guard';
import { CertificateVerificationsService } from './certificate-verifications.service';
import { VerifyCertificateDto } from './dto/verify-certificate.dto';
import { CertificateVerification } from './entities/certificate-verification.entity';

@Controller()
export class CertificateVerificationsController {
  constructor(
    private readonly certificateVerificationsService: CertificateVerificationsService,
  ) {}

  @Post('v1/certificate-verifications/:certificateId')
  @UseGuards(ApiKeyGuard)
  verify(
    @Param('certificateId') certificateId: string,
    @Body() dto: VerifyCertificateDto,
  ): Promise<CertificateVerification> {
    return this.certificateVerificationsService.verifyCertificate(
      certificateId,
      dto.verifiedByPlatformId,
    );
  }

  @Get('v1/certificate-verifications/:certificateId')
  @UseGuards(ApiKeyGuard)
  list(
    @Param('certificateId') certificateId: string,
  ): Promise<CertificateVerification[]> {
    return this.certificateVerificationsService.getVerificationsByCertificate(
      certificateId,
    );
  }
}
