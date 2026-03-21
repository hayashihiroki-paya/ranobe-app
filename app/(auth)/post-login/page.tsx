"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSession } from "next-auth/react"

export default function PostLoginPage() {
  const router = useRouter()

  useEffect(() => {
    const check = async () => {
      const session = await getSession()

      if (session?.user?.onboardingDone) {
        router.replace("/")
      } else {
        router.replace("/onboarding")
      }
    }

    check()
  }, [])

  return <p>リダイレクト中...</p>
}