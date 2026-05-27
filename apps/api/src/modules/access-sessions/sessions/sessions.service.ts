import { Injectable } from '@nestjs/common';
import { SessionVerdict } from '../../../generated/client';
import { AuditLogsService } from '../../compliance/audit-logs/audit-logs.service';
import { SessionsRepository } from './sessions.repository';
import { createSession } from './service-methods/create-session';
import { endSession } from './service-methods/end-session';
import { getSession } from './service-methods/get-session';
import { CreateSessionData, Session } from './entities/session.entity';

@Injectable()
export class SessionsService {
  constructor(
    private readonly repository: SessionsRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  createSession = (data: CreateSessionData): Promise<Session> =>
    createSession(this.repository, this.auditLogsService, data);

  endSession = (
    sessionId: string,
    riskScoreAtEnd: number,
    verdict?: SessionVerdict,
    terminationReason?: string,
  ): Promise<Session> =>
    endSession(
      this.repository,
      this.auditLogsService,
      sessionId,
      riskScoreAtEnd,
      verdict,
      terminationReason,
    );

  getSession = (id: string): Promise<Session | null> =>
    getSession(this.repository, id);
}
