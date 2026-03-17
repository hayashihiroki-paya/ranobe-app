"use client"

import { useEffect } from "react"
import { useLikeStore } from "../store/useLikeStore"

export default function LikeInitializer() {

  const setLikes = useLikeStore((s) => s.setLikes)

  useEffect(() => {

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