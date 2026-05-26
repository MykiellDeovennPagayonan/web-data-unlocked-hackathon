import { Module } from '@nestjs/common';
import { IdentitiesModule } from './identities/identities.module';
import { PlatformUsersModule } from './platform-users/platform-users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { EntityAliasesModule } from './entity-aliases/entity-aliases.module';

@Module({
  imports: [
    IdentitiesModule,
    PlatformUsersModule,
    OrganizationsModule,
    EntityAliasesModule,
  ],
})
export class IdentityModule {}
