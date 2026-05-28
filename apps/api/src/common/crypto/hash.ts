import { createHash } from 'crypto';

export function hashEmail(email: string): string {
  const normalized = email.toLowerCase().trim().normalize('NFC');
  return createHash('sha256').update(normalized).digest('hex');
}
