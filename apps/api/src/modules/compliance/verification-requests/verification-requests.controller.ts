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
import { VerificationRequestsService } from './verification-requests.service';
import { CreateVerificationRequestDto } from './dto/create-verification-request.dto';
import { UpdateVerificationStatusDto } from './dto/update-verification-status.dto';
import { VerificationRequest } from './entities/verification-request.entity';
import {
  VerificationStatus,
  VerificationType,
} from '../../../generated/client';

@Controller()
export class VerificationRequestsController {
  constructor(
    private readonly verificationRequestsService: VerificationRequestsService,
  ) {}

  @Post('v1/compliance/verification-requests')
  @UseGuards(ApiKeyGuard)
  create(
    @Body() dto: CreateVerificationRequestDto,
  ): Promise<VerificationRequest> {
    return this.verificationRequestsService.createRequest({
      identityId: dto.identityId,
      platformId: dto.platformId,
      verificationType: dto.verificationType,
      provider: dto.provider,
    });
  }

  @Get('admin/compliance/verification-requests')
  listAdmin(
    @Query('identityId') identityId?: string,
    @Query('platformId') platformId?: string,
    @Query('status') status?: VerificationStatus,
    @Query('verificationType') verificationType?: VerificationType,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<VerificationRequest[]> {
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    const parsedOffset = offset ? parseInt(offset, 10) : undefined;
    return this.verificationRequestsService.listRequests({
      identityId,
      platformId,
      status,
      verificationType,
      limit: Number.isFinite(parsedLimit) ? parsedLimit : undefined,
      offset: Number.isFinite(parsedOffset) ? parsedOffset : undefined,
    });
  }

  @Get('v1/compliance/verification-requests')
  @UseGuards(ApiKeyGuard)
  list(
    @Query('identityId') identityId?: string,
    @Query('platformId') platformId?: string,
    @Query('status') status?: VerificationStatus,
    @Query('verificationType') verificationType?: VerificationType,
  ): Promise<VerificationRequest[]> {
    return this.verificationRequestsService.listRequests({
      identityId,
      platformId,
      status,
      verificationType,
    });
  }

  @Get('v1/compliance/verification-requests/:id')
  @UseGuards(ApiKeyGuard)
  getById(@Param('id') id: string): Promise<VerificationRequest | null> {
    return this.verificationRequestsService.getRequestById(id);
  }

  @Patch('v1/compliance/verification-requests/:id/submit')
  @UseGuards(ApiKeyGuard)
  submit(@Param('id') id: string): Promise<VerificationRequest> {
    return this.verificationRequestsService.submitRequest(id);
  }

  @Post('admin/compliance/verification-requests/:id/approve')
  approve(@Param('id') id: string): Promise<VerificationRequest> {
    return this.verificationRequestsService.approveVerification(id);
  }

  @Post('admin/compliance/verification-requests/:id/reject')
  reject(
    @Param('id') id: string,
    @Body() dto: UpdateVerificationStatusDto,
  ): Promise<VerificationRequest> {
    return this.verificationRequestsService.rejectVerification(
      id,
      dto.rejectionReason,
    );
  }
}
