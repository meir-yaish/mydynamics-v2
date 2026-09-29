const rateMap = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(
  key: string,
  limit = 60,
  windowMs = 60_000,
): { ok: boolean; remaining: number } {
  const now = Date.now()
  const entry = rateMap.get(key)

  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: limit - 1 }
  }

  entry.count++
  if (entry.count > limit) {
    return { ok: false, remaining: 0 }
  }

  return { ok: true, remaining: limit - entry.count }
}
