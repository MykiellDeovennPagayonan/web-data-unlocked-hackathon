import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { IdentitiesService } from './identities.service';
import { CreateIdentityDto } from './identities/dto/create-identity.dto';
import { UpdateIdentityStatusDto } from './identities/dto/update-identity-status.dto';
import { Identity } from './identities/entities/identity.entity';

@Controller()
export class IdentitiesController {
  constructor(private readonly identitiesService: IdentitiesService) {}

  @Post('admin/identities')
  createIdentity(@Body() dto: CreateIdentityDto): Promise<Identity> {
    return this.identitiesService.createIdentity(dto);
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
