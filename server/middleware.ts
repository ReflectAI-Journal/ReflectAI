// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/app/auth'

export { auth as middleware } from '@/app/auth'

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
}

// subscription-middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getUserSubscriptions } from '@/app/actions'

export async function middleware(request: NextRequest) {
  const session = await auth(request)
  if (!session) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  const subscriptions = await getUserSubscriptions()
  if (!subscriptions.length) {
    return NextResponse.redirect(new URL('/dashboard/billing', request.url))
  }

  return NextResponse.next()
}