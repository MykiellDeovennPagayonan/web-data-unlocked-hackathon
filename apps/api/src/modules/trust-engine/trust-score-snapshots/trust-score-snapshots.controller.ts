import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../../../common/guards/api-key.guard';
import { TrustScoreSnapshotsService } from './trust-score-snapshots.service';
import { CreateSnapshotDto } from './dto/create-snapshot.dto';
import { TrustScoreSnapshot } from './entities/trust-score-snapshot.entity';
import { EntityType } from '../../../generated/client';

@Controller()
export class TrustScoreSnapshotsController {
  constructor(
    private readonly trustScoreSnapshotsService: TrustScoreSnapshotsService,
  ) {}

  @Post('v1/trust-score-snapshots')
  @UseGuards(ApiKeyGuard)
  create(@Body() dto: CreateSnapshotDto): Promise<TrustScoreSnapshot> {
    return this.trustScoreSnapshotsService.createSnapshot({
      entityType: dto.entityType,
      identityId: dto.identityId,
      orgId: dto.orgId,
      score: dto.score,
      snapshotReason: dto.snapshotReason,
      referenceId: dto.referenceId,
    });
  }

  @Get('v1/trust-score-snapshots/:entityType/:entityId')
  @UseGuards(ApiKeyGuard)
  list(
    @Param('entityType') entityType: EntityType,
    @Param('entityId') entityId: string,
  ): Promise<TrustScoreSnapshot[]> {
    return this.trustScoreSnapshotsService.getSnapshotsByEntity(
      entityType,
      entityId,
    );
  }
}
