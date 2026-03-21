// next-auth.d.ts

import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      onboardingDone?: boolean
    }
  }

  interface User {
    onboardingDone?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    onboardingDone?: boolean
  }
}