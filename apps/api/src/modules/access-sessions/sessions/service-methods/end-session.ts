import { SessionVerdict, AuditActorType } from '../../../../generated/client';
import { SessionsRepository } from '../sessions.repository';
import { AuditLogsService } from '../../../compliance/audit-logs/audit-logs.service';
import { Session } from '../entities/session.entity';

export async function endSession(
  repository: SessionsRepository,
  auditLogsService: AuditLogsService,
  sessionId: string,
  riskScoreAtEnd: number,
  verdict: SessionVerdict = SessionVerdict.clean,
  terminationReason?: string,
): Promise<Session> {
  const old = await repository.findById(sessionId);
  if (!old) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  const updated = await repository.update(sessionId, {
    riskScoreAtEnd,
    endedAt: new Date(),
    sessionVerdict: verdict,
    terminationReason,
  });

  await auditLogsService.logAction({
    actorType: AuditActorType.system,
    actorId: 'system',
    action: 'session_ended',
    targetType: 'session',
    targetId: sessionId,
    oldValue: { sessionVerdict: old.sessionVerdict, endedAt: old.endedAt },
    newValue: {
      sessionVerdict: updated.sessionVerdict,
      endedAt: updated.endedAt,
    },
  });

  return updated;
}
