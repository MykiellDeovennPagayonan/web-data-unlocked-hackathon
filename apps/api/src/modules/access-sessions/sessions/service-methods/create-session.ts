import { SessionsRepository } from '../sessions.repository';
import { AuditLogsService } from '../../../compliance/audit-logs/audit-logs.service';
import { AuditActorType } from '../../../../generated/client';
import { CreateSessionData, Session } from '../entities/session.entity';

export async function createSession(
  repository: SessionsRepository,
  auditLogsService: AuditLogsService,
  data: CreateSessionData,
): Promise<Session> {
  const session = await repository.insert(data);

  await auditLogsService.logAction({
    actorType: AuditActorType.system,
    actorId: 'system',
    action: 'session_created',
    targetType: 'session',
    targetId: session.id,
    newValue: {
      platformId: session.platformId,
      identityId: session.identityId,
      deviceId: session.deviceId,
    },
  });

  return session;
}
