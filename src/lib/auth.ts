import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from './db'
import { rateLimit } from './rate-limit'
import type { Role } from '@/generated/prisma/client'

declare module 'next-auth' {
  interface User {
    role: Role
  }
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: Role
    }
  }
}

declare module 'next-auth' {
  interface JWT {
    id: string
    role: Role
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = (credentials.email as string).toLowerCase()
        const { ok } = rateLimit(`login:${email}`, 5, 60_000)
        if (!ok) return null

        const user = await prisma.user.findUnique({
          where: { email },
        })
        if (!user) return null

        const valid = await compare(
          credentials.password as string,
          user.passwordHash,
        )
        if (!valid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 30 * 60 },
  cookies: {
    sessionToken: {
      name: 'md.session',
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!
        token.role = user.role
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as Role
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
})
