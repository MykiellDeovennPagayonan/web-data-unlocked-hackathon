import { tl } from "./trustlayer"
import { PLATFORM_ID } from "./trustlayer"
import type { DeviceSignal } from "@trust-layer/tunai"

function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i)
    hash = (hash << 5) - hash + chr
    hash |= 0
  }
  return Math.abs(hash).toString(16).slice(0, 8)
}

function makeDeviceSignals(userAgent: string, ip: string): DeviceSignal[] {
  const uaHash = hashString(userAgent)
  const ipHash = hashString(ip)
  return [
    { signalType: "canvas_hash", value: `bot-c-${uaHash}` },
    { signalType: "webgl_hash", value: `bot-w-${ipHash}` },
    { signalType: "screen_resolution", value: "unknown" },
    { signalType: "os", value: "unknown" },
    { signalType: "timezone", value: "UTC" },
    { signalType: "user_agent", value: userAgent },
  ]
}

export async function logApiAccess({
  ip,
  userAgent,
  verdict,
}: {
  ip: string
  userAgent: string
  verdict: "allowed" | "flagged" | "throttled" | "blocked"
}) {
  try {
    const ipRecord = await tl.lookupIp(ip)
    const { device } = await tl.resolveDevice(makeDeviceSignals(userAgent, ip))
    await tl.logAccessEvent({
      platformId: PLATFORM_ID,
      ipId: ipRecord.id,
      deviceId: device.id,
      eventType: "api_call",
      verdict,
      scoreAtEvent: Number(ipRecord.riskScore),
      triggeredRules: {},
    })
  } catch (err) {
    // Non-fatal — don't block request if logging fails
    console.warn("[TrustLayer] Failed to log access event:", err)
  }
}
