import { SessionsRepository } from '../sessions.repository';
import { CreateSessionData, Session } from '../entities/session.entity';

export async function createSession(
  repository: SessionsRepository,
  data: CreateSessionData,
): Promise<Session> {
  return repository.insert(data);
}
