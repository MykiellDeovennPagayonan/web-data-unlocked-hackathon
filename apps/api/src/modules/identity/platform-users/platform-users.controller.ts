import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { PlatformUsersService } from './platform-users.service';
import { CreatePlatformUserDto } from './dto/create-platform-user.dto';
import { UpdatePlatformUserStatusDto } from './dto/update-platform-user-status.dto';
import { PlatformUser } from './entities/platform-user.entity';

@Controller()
export class PlatformUsersController {
  constructor(private readonly platformUsersService: PlatformUsersService) {}

  @Post('v1/platform-users')
  createPlatformUser(
    @Body() dto: CreatePlatformUserDto,
  ): Promise<PlatformUser> {
    return this.platformUsersService.createPlatformUser(dto);
  }

  @Get('v1/platform-users/:externalId')
  getPlatformUserByExternalId(
    @Param('externalId') externalUserId: string,
    // TODO: Get platformId from API key context
  ): Promise<PlatformUser | null> {
    void externalUserId;
    throw new Error(
      'Not implemented - requires API key auth for platform context',
    );
  }

  @Patch('v1/platform-users/:externalId/status')
  updatePlatformUserStatus(
    @Param('externalId') externalUserId: string,
    @Body() dto: UpdatePlatformUserStatusDto,
  ): Promise<PlatformUser> {
    void externalUserId;
    void dto;
    throw new Error(
      'Not implemented - requires API key auth for platform context',
    );
  }
}
