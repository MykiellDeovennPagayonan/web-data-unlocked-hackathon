-- DropForeignKey
ALTER TABLE "access_events" DROP CONSTRAINT "access_events_deviceId_fkey";

-- AlterTable
ALTER TABLE "access_events" ALTER COLUMN "deviceId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "access_events" ADD CONSTRAINT "access_events_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
