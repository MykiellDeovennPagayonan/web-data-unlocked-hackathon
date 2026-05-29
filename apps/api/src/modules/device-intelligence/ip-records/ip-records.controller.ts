import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../../../common/guards/api-key.guard';
import { IpRecordsService } from './ip-records.service';
import { LookupIpDto } from './dto/lookup-ip.dto';
import { IpRecord } from './entities/ip-record.entity';
import { VelocityResult } from './service-methods/track-ip-velocity';

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

  @Get('admin/ip/:ip')
  getIpRecord(@Param('ip') ip: string): Promise<IpRecord> {
    return this.ipRecordsService.getIpIntelligence(ip);
  }
}
