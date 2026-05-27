import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../../../common/guards/api-key.guard';
import { BackgroundCheckResultsService } from './background-check-results.service';
import { CreateBackgroundCheckResultDto } from './dto/create-background-check-result.dto';
import { BackgroundCheckResult } from './entities/background-check-result.entity';

@Controller()
export class BackgroundCheckResultsController {
  constructor(
    private readonly backgroundCheckResultsService: BackgroundCheckResultsService,
  ) {}

  @Post('v1/background-checks/:id/results')
  @UseGuards(ApiKeyGuard)
  addResult(
    @Param('id') checkId: string,
    @Body() dto: CreateBackgroundCheckResultDto,
  ): Promise<BackgroundCheckResult> {
    return this.backgroundCheckResultsService.addCheckResult({
      checkId,
      source: dto.source,
      rawResult: dto.rawResult,
      normalizedVerdict: dto.normalizedVerdict,
      confidenceScore: dto.confidenceScore,
      llmSummary: dto.llmSummary,
    });
  }

  @Get('v1/background-checks/:id/results')
  @UseGuards(ApiKeyGuard)
  getResults(@Param('id') checkId: string): Promise<BackgroundCheckResult[]> {
    return this.backgroundCheckResultsService.getResultsByCheckId(checkId);
  }
}
