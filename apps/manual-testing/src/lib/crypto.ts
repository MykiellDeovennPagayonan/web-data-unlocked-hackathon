const TEST_KEY = 'raEiRdE7HIxG4KqrmEN/6MG1OyQdLLujxczW6B5K7os=';

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    base64ToBytes(TEST_KEY) as BufferSource,
    'AES-GCM',
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encrypt(value: string): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(value)
  );
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return bytesToBase64(combined);
}

export async function decrypt(ciphertext: string): Promise<string> {
  const key = await getKey();
  const combined = base64ToBytes(ciphertext);
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  return new TextDecoder().decode(decrypted);
}

export function isCiphertext(value: string): boolean {
  if (!value || value.startsWith('ENC(')) return false;
  try {
    atob(value);
    return true;
  } catch {
    return false;
  }
}

export function unwrapEnc(value: string): string {
  const match = value.match(/^ENC\((.*)\)$/);
  return match ? match[1] : value;
}
