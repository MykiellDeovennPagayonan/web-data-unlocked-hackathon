import type { TunaiConfig } from "./types"

export class TunaiError extends Error {
  status: number
  body: string
  cleanMessage: string

  constructor(status: number, body: string, method: string, path: string) {
    let cleanMessage = body
    try {
      const parsed = JSON.parse(body)
      if (parsed.message) cleanMessage = parsed.message
    } catch {
      // body is not JSON — use raw text
    }
    super(`[tunai] ${method} ${path} → ${status}: ${cleanMessage}`)
    this.status = status
    this.body = body
    this.cleanMessage = cleanMessage
    this.name = "TunaiError"
  }
}

export async function tunaiRequest<T>(
  config: TunaiConfig,
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${config.baseUrl}${path}`, {
    ...options,
    signal: AbortSignal.timeout(8000),
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      ...(options.headers ?? {}),
    },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new TunaiError(res.status, body, options.method ?? "GET", path)
  }
  return res.json() as Promise<T>
}

export function post<T>(config: TunaiConfig, path: string, body: unknown): Promise<T> {
  return tunaiRequest<T>(config, path, {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export function get<T>(config: TunaiConfig, path: string): Promise<T> {
  return tunaiRequest<T>(config, path)
}
