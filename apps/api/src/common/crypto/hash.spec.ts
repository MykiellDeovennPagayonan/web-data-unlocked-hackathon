import { hashEmail } from './hash';

describe('hashEmail', () => {
  it('should return a consistent SHA-256 hex hash for a normalized email', () => {
    const result = hashEmail('Test@Example.COM');
    // Normalized to test@example.com, then hashed
    expect(result).toBe(
      '973dfe463ec85785f5f95af5ba3906eedb2d931c24e69824a89ea65dba4e813b',
    );
    expect(result).toHaveLength(64);
  });

  it('should throw a clear error when email is null', () => {
    expect(() => hashEmail(null as unknown as string)).toThrow(
      'Email is required',
    );
  });

  it('should throw a clear error when email is undefined', () => {
    expect(() => hashEmail(undefined as unknown as string)).toThrow(
      'Email is required',
    );
  });

  it('should throw a clear error when email is an empty string', () => {
    expect(() => hashEmail('')).toThrow('Email is required');
  });
});
