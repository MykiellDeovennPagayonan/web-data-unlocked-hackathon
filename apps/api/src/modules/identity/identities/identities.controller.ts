import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { IdentitiesService } from './identities.service';
import { CreateIdentityDto } from './dto/create-identity.dto';
import { UpdateIdentityStatusDto } from './dto/update-identity-status.dto';
import { Identity } from './entities/identity.entity';

@Controller()
export class IdentitiesController {
  constructor(private readonly identitiesService: IdentitiesService) {}

  @Post('admin/identities')
  createIdentity(@Body() dto: CreateIdentityDto): Promise<Identity> {
    return this.identitiesService.createIdentity(dto);
  }

  @Get('admin/identities')
  listIdentities(
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ): Promise<Identity[]> {
    const parsedTake = take ? parseInt(take, 10) : undefined;
    const parsedSkip = skip ? parseInt(skip, 10) : undefined;
    return this.identitiesService.listIdentities(
      Number.isFinite(parsedTake) ? parsedTake : undefined,
      Number.isFinite(parsedSkip) ? parsedSkip : undefined,
    );
  }

  @Get('admin/identities/:id')
  getIdentityById(@Param('id') id: string): Promise<Identity | null> {
    return this.identitiesService.getIdentityById(id);
  }

  @Get('admin/identities/by-email/:hash')
  getIdentityByEmailHash(
    @Param('hash') hash: string,
  ): Promise<Identity | null> {
    return this.identitiesService.getIdentityByEmailHash(hash);
  }

  @Patch('admin/identities/:id/status')
  updateTrustStatus(
    @Param('id') id: string,
    @Body() dto: UpdateIdentityStatusDto,
  ): Promise<Identity> {
    return this.identitiesService.updateTrustStatus(id, dto.trustStatus);
  }
}
