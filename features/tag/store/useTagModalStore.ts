"use client"

import { create } from "zustand"

type TagModalState = {
  isOpen: boolean
  isbn: string | null
  open: (isbn: string) => void
  close: () => void
}

export const useTagModalStore = create<TagModalState>((set) => ({
  isOpen: false,
  isbn: null,

  open: (isbn) =>
    set({
      isOpen: true,
      isbn
    }),

  close: () =>
    set({
      isOpen: false,
      isbn: null
    })
}))