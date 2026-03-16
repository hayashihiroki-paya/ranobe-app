"use client"

import { useLikeInitializer } from "@/features/like/hooks/useLikeInitializer"
import { SessionProvider } from "next-auth/react"

export default function Providers({
  children,
}: {
  children: React.ReactNode
}) {

  useLikeInitializer()

  return (

    <SessionProvider>

      {children}

    </SessionProvider>

  )

}