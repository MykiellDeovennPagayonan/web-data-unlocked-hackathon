import { createClient } from "@trust-layer/tunai"

const BASE = process.env.TRUSTLAYER_API_URL ?? "http://localhost:8090"
const KEY = process.env.TRUSTLAYER_API_KEY ?? ""

export const tl = createClient({ baseUrl: BASE, apiKey: KEY })
export const PLATFORM_ID = process.env.TRUSTLAYER_PLATFORM_ID ?? ""
