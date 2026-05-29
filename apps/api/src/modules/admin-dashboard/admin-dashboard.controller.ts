import { Controller, Get, Query } from '@nestjs/common';
import { AdminDashboardService } from './admin-dashboard.service';
import type { AdminDashboardDto } from './admin-dashboard.types';

@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get()
  getDashboard(
    @Query('platformId') platformId?: string,
  ): Promise<AdminDashboardDto> {
    return this.adminDashboardService.getDashboard(platformId);
  }
}
