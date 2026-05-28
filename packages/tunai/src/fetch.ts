import type { TunaiConfig } from "./types"

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
    throw new Error(`[tunai] ${options.method ?? "GET"} ${path} → ${res.status}: ${body}`)
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
