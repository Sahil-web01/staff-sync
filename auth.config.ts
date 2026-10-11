import type { NextAuthConfig } from 'next-auth'

const THIRTY_DAYS_SECONDS = 30 * 24 * 60 * 60 // 30 days (1 month)

export const authConfig: NextAuthConfig = {
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      const now = Date.now()
      const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

      if (user) {
        token.id = user.id
        token.role = user.role
        token.companyId = (user as { companyId?: string }).companyId
        token.lastActive = now
      } else if (token.lastActive && typeof token.lastActive === 'number') {
        if (now - token.lastActive > THIRTY_DAYS_MS) {
          return null
        }
        token.lastActive = now
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.id) session.user.id = token.id as string
        if (token.role) session.user.role = token.role as string
        if (token.companyId) (session.user as { companyId?: string }).companyId = token.companyId as string
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: THIRTY_DAYS_SECONDS,
    updateAge: 24 * 60 * 60,
  },
}
