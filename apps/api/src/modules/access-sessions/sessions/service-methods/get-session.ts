import { SessionsRepository } from '../sessions.repository';
import { Session } from '../entities/session.entity';

export async function getSession(
  repository: SessionsRepository,
  id: string,
): Promise<Session | null> {
  return repository.findById(id);
}
