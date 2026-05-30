-- DropForeignKey
ALTER TABLE "entity_aliases" DROP CONSTRAINT "entity_aliases_identity_fk";

-- DropForeignKey
ALTER TABLE "entity_aliases" DROP CONSTRAINT "entity_aliases_org_fk";

-- AlterTable
ALTER TABLE "entity_aliases" ADD COLUMN     "identityId" TEXT,
ADD COLUMN     "orgId" TEXT;

-- AddForeignKey
ALTER TABLE "entity_aliases" ADD CONSTRAINT "entity_aliases_identity_fk" FOREIGN KEY ("identityId") REFERENCES "identities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_aliases" ADD CONSTRAINT "entity_aliases_org_fk" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
