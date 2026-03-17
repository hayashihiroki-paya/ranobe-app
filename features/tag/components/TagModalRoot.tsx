"use client"

import TagModal from "@/features/tag/components/TagModal"
import { useTagModalStore } from "@/features/tag/store/useTagModalStore"

export default function TagModalRoot() {

  const { isOpen, isbn, close } = useTagModalStore()

  if (!isOpen || !isbn) return null

  return (
    <TagModal
      isbn={isbn}
      isOpen={isOpen}
      onClose={close}
    />
  )
}