import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const WINDOW_MS = 60_000
const GENERAL_LIMIT = 150
const CHAT_LIMIT = 20
const MUTATION_LIMIT = 10

function tooMany(retryAfter: number) {
  return new Response(JSON.stringify({ error: 'Demasiadas solicitudes. Espera un momento e inténtalo de nuevo.' }), {
    status: 429,
    headers: { 'Content-Type': 'application/json', 'Retry-After': String(retryAfter) },
  })
}

export async function proxy(request: NextRequest) {
  const ip = getClientIp(request)
  const path = request.nextUrl.pathname

  if (path === '/api/chat') {
    const result = checkRateLimit(`rl:${ip}:chat`, CHAT_LIMIT, WINDOW_MS)
    if (!result.ok) return tooMany(result.retryAfter)
    return NextResponse.next({ request })
  }

  if (path === '/api/orders' || path === '/api/profile') {
    const result = checkRateLimit(`rl:${ip}:mut`, MUTATION_LIMIT, WINDOW_MS)
    if (!result.ok) return tooMany(result.retryAfter)
  }

  const general = checkRateLimit(`rl:${ip}`, GENERAL_LIMIT, WINDOW_MS)
  if (!general.ok) return tooMany(general.retryAfter)

  return updateSession(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}