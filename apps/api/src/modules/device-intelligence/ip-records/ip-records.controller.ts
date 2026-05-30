import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiKeyGuard } from '../../../common/guards/api-key.guard';
import { IpRecordsService } from './ip-records.service';
import { LookupIpDto } from './dto/lookup-ip.dto';
import { TrackIpProbeDto } from './dto/track-ip-probe.dto';
import { IpRecord } from './entities/ip-record.entity';
import { VelocityResult } from './service-methods/track-ip-velocity';
import { ProbeResult } from './service-methods/track-ip-probe';

@Controller()
export class IpRecordsController {
  constructor(private readonly ipRecordsService: IpRecordsService) {}

  @Post('v1/intelligence/ip')
  @UseGuards(ApiKeyGuard)
  lookupIp(@Body() dto: LookupIpDto): Promise<IpRecord> {
    return this.ipRecordsService.getIpIntelligence(dto.ipAddress);
  }

  @Post('v1/intelligence/ip/velocity')
  @UseGuards(ApiKeyGuard)
  trackVelocity(@Body() dto: LookupIpDto): Promise<VelocityResult> {
    return this.ipRecordsService.trackVelocity(dto.ipAddress);
  }

@Get('admin/ip-records')
listIpRecords(
  @Query('take') take?: string,
  @Query('skip') skip?: string,
): Promise<IpRecord[]> {
  const parsedTake = take ? parseInt(take, 10) : undefined;
  const parsedSkip = skip ? parseInt(skip, 10) : undefined;
  return this.ipRecordsService.listIpRecords(
    Number.isFinite(parsedTake) ? parsedTake : undefined,
    Number.isFinite(parsedSkip) ? parsedSkip : undefined,
  );
}

@Post('v1/intelligence/ip/probe')
@UseGuards(ApiKeyGuard)
trackProbe(@Body() dto: TrackIpProbeDto): Promise<ProbeResult> {
  return this.ipRecordsService.trackProbe(
    dto.ipAddress,
    dto.endpointSignature,
  );
}

  @Get('admin/ip/:ip')
  getIpRecord(@Param('ip') ip: string): Promise<IpRecord> {
    return this.ipRecordsService.getIpIntelligence(ip);
  }

  @Post('admin/ip/:ip/unban')
  unbanIp(@Param('ip') ip: string): Promise<{ count: number }> {
    return this.ipRecordsService.unbanIp(ip);
  }
}
