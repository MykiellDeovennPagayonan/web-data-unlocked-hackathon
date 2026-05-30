import { wipeDatabase } from './wipe-database';

export default async function globalSetup() {
  await wipeDatabase();
}
