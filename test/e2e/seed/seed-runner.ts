import { seedSocialMedia } from './seed-social-media'

seedSocialMedia().catch((err: unknown) => {
  console.error('Seeding failed:', err)
  process.exit(1)
})
