import { SessionVerdict } from '../../../../generated/client';
import { SessionsRepository } from '../sessions.repository';
import { Session } from '../entities/session.entity';

export async function endSession(
  repository: SessionsRepository,
  sessionId: string,
  riskScoreAtEnd: number,
  verdict: SessionVerdict = SessionVerdict.clean,
  terminationReason?: string,
): Promise<Session> {
  return repository.update(sessionId, {
    riskScoreAtEnd,
    endedAt: new Date(),
    sessionVerdict: verdict,
    terminationReason,
  });
}
