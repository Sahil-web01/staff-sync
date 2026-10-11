import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

// 30 days inactivity limit in milliseconds (1 month)
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role

  const lastVisitCookie = req.cookies.get('staffsync_last_visit')?.value
  const lastVisitTimestamp = lastVisitCookie ? Number(lastVisitCookie) : null
  const now = Date.now()

  // Detect if user has not visited for over 1 month
  const isInactiveOverOneMonth = !!(
    lastVisitTimestamp &&
    !isNaN(lastVisitTimestamp) &&
    now - lastVisitTimestamp > ONE_MONTH_MS
  )

  if (isInactiveOverOneMonth) {
    const expiredUrl = new URL('/login?expired=true', req.nextUrl)
    const response = NextResponse.redirect(expiredUrl)

    // Clear session cookies and inactivity tracking cookie
    response.cookies.delete('staffsync_last_visit')
    response.cookies.delete('authjs.session-token')
    response.cookies.delete('__Secure-authjs.session-token')
    return response
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (pathname.startsWith('/admin') && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', req.nextUrl))
  }

  // Update sliding activity cookie to keep track of website visits
  const response = NextResponse.next()
  response.cookies.set({
    name: 'staffsync_last_visit',
    value: String(now),
    path: '/',
    maxAge: 60 * 24 * 60 * 60, // 60 days retention to allow detecting 30+ days inactivity
    httpOnly: true,
    sameSite: 'lax',
  })

  return response
})

export const config = {
  matcher: ['/admin', '/admin/:path*', '/employee', '/employee/:path*', '/dashboard', '/dashboard/:path*'],
}
