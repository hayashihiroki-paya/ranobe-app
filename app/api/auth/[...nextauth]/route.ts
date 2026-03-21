// app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) return null

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isValid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          onboardingDone: user.onboardingDone, // 👈 追加
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    // 🔥 JWTに保存
    async jwt({ token, user }) {
      // 初回ログイン時
      if (user) {
        token.id = user.id
        token.onboardingDone = user.onboardingDone ?? false
      }

      // Googleログイン時など（userが無い場合の補完）
      if (token.email && token.onboardingDone === undefined) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        })

        token.onboardingDone = dbUser?.onboardingDone ?? false
      }

      return token
    },

    // 🔥 sessionに渡す
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.onboardingDone = token.onboardingDone as boolean
      }
      return session
    },
  },

  // 👇 ログインページ指定（これ重要）
  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
} satisfies import("next-auth").AuthOptions

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }