import { createHash } from 'crypto';

export function hashEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    throw new Error('Email is required');
  }
  const normalized = email.toLowerCase().trim().normalize('NFC');
  return createHash('sha256').update(normalized).digest('hex');
}
