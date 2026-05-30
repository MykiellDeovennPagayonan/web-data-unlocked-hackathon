import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@trust-layer/tunai"

const TL_API_URL = process.env.TRUSTLAYER_API_URL ?? "http://localhost:8090"
const TL_API_KEY = process.env.TRUSTLAYER_API_KEY ?? ""

export const config = {
  matcher: "/api/:path*",
}

export async function middleware(request: NextRequest) {
  // Skip TrustLayer check for seed endpoint (e2e tests)
  if (request.nextUrl.pathname === '/api/seed') {
    return NextResponse.next()
  }

  if (!TL_API_KEY) {
    return NextResponse.next()
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "127.0.0.1"

  try {
    const tl = createClient({ baseUrl: TL_API_URL, apiKey: TL_API_KEY })
    const ipRecord = await tl.lookupIp(ip)

    if (ipRecord.isBlacklisted) {
      const source = ipRecord.blacklistSource ?? 'unknown'
      console.warn(`[TrustLayer] Blocked IP ${ip}: blacklisted (source: ${source})`)
      return NextResponse.json(
        {
          error: "Access denied",
          message: `Your IP address has been flagged for suspicious activity.`,
        },
        { status: 403 }
      )
    }
  } catch {
    // Non-fatal — let the request through if TrustLayer is unreachable
  }

  return NextResponse.next()
}
