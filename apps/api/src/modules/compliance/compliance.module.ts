import { Module, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TrustEngineModule } from '../trust-engine/trust-engine.module';
import { AuditLogsController } from './audit-logs/audit-logs.controller';
import { AuditLogsService } from './audit-logs/audit-logs.service';
import { AuditLogsRepository } from './audit-logs/audit-logs.repository';
import { ConsentRecordsController } from './consent-records/consent-records.controller';
import { ConsentRecordsService } from './consent-records/consent-records.service';
import { ConsentRecordsRepository } from './consent-records/consent-records.repository';
import { VerificationRequestsController } from './verification-requests/verification-requests.controller';
import { VerificationRequestsService } from './verification-requests/verification-requests.service';
import { VerificationRequestsRepository } from './verification-requests/verification-requests.repository';

@Module({
  imports: [forwardRef(() => TrustEngineModule)],
  controllers: [
    AuditLogsController,
    ConsentRecordsController,
    VerificationRequestsController,
  ],
  providers: [
    PrismaService,
    AuditLogsService,
    AuditLogsRepository,
    ConsentRecordsService,
    ConsentRecordsRepository,
    VerificationRequestsService,
    VerificationRequestsRepository,
  ],
  exports: [
    AuditLogsService,
    ConsentRecordsService,
    VerificationRequestsService,
  ],
})
export class ComplianceModule {}
