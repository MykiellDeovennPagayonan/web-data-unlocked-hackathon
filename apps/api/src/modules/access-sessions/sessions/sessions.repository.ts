import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { insertSession } from './repository-ops/insert-session';
import { findSessionById } from './repository-ops/find-session-by-id';
import { updateSession } from './repository-ops/update-session';
import { findSessionsByIdentity } from './repository-ops/find-sessions-by-identity';
import {
  CreateSessionData,
  Session,
  UpdateSessionData,
} from './entities/session.entity';

@Injectable()
export class SessionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  insert = (data: CreateSessionData): Promise<Session> =>
    insertSession(this.prisma, data);

  findById = (id: string): Promise<Session | null> =>
    findSessionById(this.prisma, id);

  update = (id: string, data: UpdateSessionData): Promise<Session> =>
    updateSession(this.prisma, id, data);

  findByIdentity = (identityId: string, take?: number): Promise<Session[]> =>
    findSessionsByIdentity(this.prisma, identityId, take);
}
