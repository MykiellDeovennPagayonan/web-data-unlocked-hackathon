import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { AuditLog } from './entities/audit-log.entity';
import { AuditActorType } from '../../../generated/client';

@Controller()
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Post('admin/compliance/audit-logs')
  create(@Body() dto: CreateAuditLogDto): Promise<AuditLog> {
    return this.auditLogsService.logAction({
      actorType: dto.actorType,
      actorId: dto.actorId,
      action: dto.action,
      targetType: dto.targetType,
      targetId: dto.targetId,
      oldValue: dto.oldValue,
      newValue: dto.newValue,
    });
  }

  @Get('admin/compliance/audit-logs')
  list(
    @Query('actorType') actorType?: AuditActorType,
    @Query('actorId') actorId?: string,
    @Query('action') action?: string,
    @Query('targetType') targetType?: string,
    @Query('targetId') targetId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<AuditLog[]> {
    return this.auditLogsService.listAuditLogs({
      actorType,
      actorId,
      action,
      targetType,
      targetId,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  }
}
