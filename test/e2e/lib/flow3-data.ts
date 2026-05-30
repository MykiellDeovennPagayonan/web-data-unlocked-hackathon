/**
 * Deterministic data for Flow 3 — Bot Scraper Attack.
 */

export const FLOW3 = {
  /** The fixed IP the bot will spoof via x-forwarded-for */
  botIp: '203.0.113.45',

  /** Bot-like user-agent string */
  botUserAgent: 'ScraperBot/1.0 (BotScraper; +http://bot.example.com/bot.html)',

  /** Number of rapid requests to simulate the scraping burst */
  burstCount: 60,

  /** How many pages the bot cycles through (causes endpoint probe) */
  pagesToScrape: 10,

  /** Seed user data (must match SOCIAL_MEDIA.seedUsers schema) */
  seedUsers: [
    {
      name: 'Alice Seed',
      email: 'seed.user.1@e2e.local',
      password: 'TestPass123!',
      posts: [
        "Hello from Alice!\nThis is a seeded post for e2e testing.",
        "Another day, another test.\nExcited to see how the demo works!",
        "Alice post three:\nBot scraping is a real threat to platforms.",
        "Alice post four:\nTrustLayer helps detect automated abuse.",
        "Alice post five:\nData harvesting at scale damages ecosystems.",
        "Alice post six:\nHere is enough content for pagination.",
      ],
    },
    {
      name: 'Bob Seed',
      email: 'seed.user.2@e2e.local',
      password: 'TestPass123!',
      posts: [
        "Bob here!\nJust seeding data for the social media demo.",
        "Testing is fun when everything works as expected.",
        "Bob post three:\nScrapers often use datacenter IPs.",
        "Bob post four:\nSequential pagination is a tell-tale sign.",
        "Bob post five:\nEndpoint probing reveals bot behavior.",
        "Bob post six:\nVelocity spikes mean automation.",
      ],
    },
    {
      name: 'Carol Seed',
      email: 'seed.user.3@e2e.local',
      password: 'TestPass123!',
      posts: [
        "Carol's first post!\nSharing insights about web security.",
        "Multi-page feeds need lots of content.\nHere is another post.",
        "Carol post three:\nBots don't send browser fingerprint signals.",
        "Carol post four:\nRepeated user-agents are suspicious.",
        "Carol post five:\nRapid request intervals = automation.",
        "Carol post six:\nTrustLayer scores IPs in real time.",
      ],
    },
    {
      name: 'David Seed',
      email: 'seed.user.4@e2e.local',
      password: 'TestPass123!',
      posts: [
        "David seeding data for the scraper demo.\nThis content will be harvested.",
        "Pagination only shows when there are many posts.\nSo we need lots of content.",
        "David post three:\nThe same IP hitting every endpoint = probe.",
        "David post four:\nCross-platform intelligence blocks repeat attackers.",
        "David post five:\nA block on one site protects all others.",
        "David post six:\nThis is the network effect in action.",
      ],
    },
    {
      name: 'Eve Seed',
      email: 'seed.user.5@e2e.local',
      password: 'TestPass123!',
      posts: [
        "Eve here with more test content.\nThe bot will scrape this post too.",
        "Demo data needs to look realistic.\nThis is post number two for Eve.",
        "Eve post three:\nBehavioral detection beats static blocklists.",
        "Eve post four:\nBright Data infrastructure powers detection.",
        "Eve post five:\nThe tool that enables scraping also enables protection.",
        "Eve post six:\nThat is the Bright Data inversion.",
      ],
    },
  ] as const,
} as const
