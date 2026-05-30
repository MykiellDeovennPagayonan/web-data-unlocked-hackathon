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
import { DevicesService } from './devices.service';
import { ResolveDeviceDto } from './dto/resolve-device.dto';
import { Device } from './entities/device.entity';

@Controller()
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post('v1/intelligence/device')
  @UseGuards(ApiKeyGuard)
  resolveDevice(
    @Body() dto: ResolveDeviceDto,
  ): Promise<{ device: Device; isNew: boolean }> {
    return this.devicesService.resolveOrCreateDevice(dto.signals);
  }

  @Get('admin/devices')
  listDevices(
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ): Promise<Device[]> {
    const parsedTake = take ? parseInt(take, 10) : undefined;
    const parsedSkip = skip ? parseInt(skip, 10) : undefined;
    return this.devicesService.listDevices(
      Number.isFinite(parsedTake) ? parsedTake : undefined,
      Number.isFinite(parsedSkip) ? parsedSkip : undefined,
    );
  }

  @Get('admin/devices/:id')
  getDeviceById(@Param('id') id: string): Promise<Device | null> {
    return this.devicesService.getDeviceById(id);
  }
}
