/*
  Warnings:

  - A unique constraint covering the columns `[certificateHash]` on the table `trust_certificates` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "trust_certificates_certificateHash_key" ON "trust_certificates"("certificateHash");
