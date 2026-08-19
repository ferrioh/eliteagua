import type { NextRequest } from 'next/server'

type Entry = { count: number; resetAt: number }

const store = new Map<string, Entry>()

function sweep(now: number) {
  if (store.size < 1000) return
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key)
  }
}

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0].trim()
    if (first) return first
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp
  return 'unknown'
}

export function checkRateLimit(key: string, limit: number, windowMs: number): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now()
  sweep(now)
  const entry = store.get(key)
  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true }
  }
  entry.count += 1
  if (entry.count > limit) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) }
  }
  return { ok: true }
}