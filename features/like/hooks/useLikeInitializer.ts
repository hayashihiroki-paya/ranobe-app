// features\like\hooks\useLikeInitializer.ts
"use client"

import { useEffect } from "react"
import { useLikeStore } from "../store/useLikeStore"
import { useSession } from "next-auth/react"

export default function useLikeInitializer() {

  const { status } = useSession()

  const setLikes = useLikeStore((s) => s.setLikes)

  useEffect(() => {

    if (status !== "authenticated") return

    async function fetchLikes() {

      const res = await fetch("/api/like")

      if (!res.ok) return

      const data = await res.json()

      setLikes(data)

    }

    fetchLikes()

  }, [setLikes])

  return null
}