import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiKeyGuard } from '../../../common/guards/api-key.guard';
import { CurrentPlatform } from '../../../common/decorators/current-platform.decorator';
import {
  PlatformUsersService,
  SuspiciousEmailDomainError,
  SuspiciousEmailPatternError,
} from './platform-users.service';
import { CreatePlatformUserDto } from './dto/create-platform-user.dto';
import { UpdatePlatformUserStatusDto } from './dto/update-platform-user-status.dto';
import { PlatformUser } from './entities/platform-user.entity';

@Controller()
export class PlatformUsersController {
  constructor(private readonly platformUsersService: PlatformUsersService) {}

  @Post('v1/platform-users')
  @UseGuards(ApiKeyGuard)
  async createPlatformUser(
    @CurrentPlatform() platformId: string,
    @Body() dto: CreatePlatformUserDto,
  ): Promise<PlatformUser> {
    try {
      return await this.platformUsersService.createPlatformUser({
        ...dto,
        platformId,
      });
    } catch (error) {
      console.log(
        `[FLOW2] Controller caught error:`,
        error instanceof Error ? error.message : error,
      );
      if (
        error instanceof SuspiciousEmailDomainError ||
        error instanceof SuspiciousEmailPatternError
      ) {
        console.log(`[FLOW2] Throwing 403: ${(error as Error).message}`);
        throw new ForbiddenException((error as Error).message);
      }
      throw error;
    }
  }

  @Get('v1/platform-users/:externalId')
  @UseGuards(ApiKeyGuard)
  async getPlatformUserByExternalId(
    @CurrentPlatform() platformId: string,
    @Param('externalId') externalUserId: string,
  ): Promise<PlatformUser> {
    const user = await this.platformUsersService.getPlatformUserByExternalId(
      platformId,
      externalUserId,
    );
    if (!user) {
      throw new NotFoundException(
        `Platform user '${externalUserId}' not found`,
      );
    }
    return user;
  }

  @Patch('v1/platform-users/:externalId/status')
  @UseGuards(ApiKeyGuard)
  async updatePlatformUserStatus(
    @CurrentPlatform() platformId: string,
    @Param('externalId') externalUserId: string,
    @Body() dto: UpdatePlatformUserStatusDto,
  ): Promise<PlatformUser> {
    const user = await this.platformUsersService.getPlatformUserByExternalId(
      platformId,
      externalUserId,
    );
    if (!user) {
      throw new NotFoundException(
        `Platform user '${externalUserId}' not found`,
      );
    }
    return this.platformUsersService.updatePlatformUserStatus(
      user.id,
      dto.statusOnPlatform,
    );
  }
}
