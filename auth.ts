import NextAuth, { type DefaultSession } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { authConfig } from './auth.config'

declare module 'next-auth' {
  interface User {
    role?: string
    companyId?: string
  }

  interface Session {
    user: {
      role?: string
      companyId?: string
    } & DefaultSession['user']
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id?: string
    role?: string
    companyId?: string
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        await connectDB()

        const email = (credentials.email as string).toLowerCase().trim()
        const user = await User.findOne({ email })

        if (!user || !user.password) {
          return null
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) {
          return null
        }

        await User.findByIdAndUpdate(user._id, { lastActive: new Date() })

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.companyId || 'default-org',
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.companyId = user.companyId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.id) session.user.id = token.id as string
        if (token.role) session.user.role = token.role as string
        if (token.companyId) session.user.companyId = token.companyId as string
      }
      return session
    },
  },
})
