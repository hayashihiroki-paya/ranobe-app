"use client"

import { useEffect } from "react"
import { useLikeStore } from "../store/useLikeStore"

export function useLikeInitializer() {

  const setLikes = useLikeStore((state) => state.setLikes)

  useEffect(() => {

    const init = async () => {

      try {

        const res = await fetch("/api/like")

        if (!res.ok) return

        const data = await res.json()

        setLikes(data)

      } catch (err) {

        console.error(err)

      }

    }

    init()

  }, [setLikes])

}