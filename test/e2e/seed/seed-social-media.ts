import { SOCIAL_MEDIA } from '../fixtures/test-data'

/**
 * Seed the social media DB via the app's /api/seed endpoint.
 * Uses Prisma client on the server side, so no raw SQL needed.
 */

const SEED_SECRET = process.env.SEED_SECRET || 'dev-seed-secret'

export async function seedSocialMedia() {
  const response = await fetch(`${SOCIAL_MEDIA.url}/api/seed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SEED_SECRET}`,
    },
    body: JSON.stringify({ users: SOCIAL_MEDIA.seedUsers }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Seed failed: ${response.status} ${text}`)
  }

  const data = await response.json()
  console.log('Seed complete:', data.message, '- created', data.users?.length, 'users')
}
