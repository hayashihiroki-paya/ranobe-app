// features/like/store/useLikeStore.ts

import { create } from "zustand"

type LikeState = {

  likedIsbns: string[]

  setLikes: (isbns: string[]) => void

  like: (isbn: string) => void

  unlike: (isbn: string) => void

  isLiked: (isbn: string) => boolean

}

export const useLikeStore = create<LikeState>((set, get) => ({

  likedIsbns: [],

  setLikes: (isbns) =>
    set({ likedIsbns: isbns }),

  like: (isbn) =>
    set((state) => {

      if (state.likedIsbns.includes(isbn)) return state

      return {
        likedIsbns: [...state.likedIsbns, isbn]
      }

    }),

  unlike: (isbn) =>
    set((state) => ({
      likedIsbns: state.likedIsbns.filter((i) => i !== isbn)
    })),

  isLiked: (isbn) =>
    get().likedIsbns.includes(isbn)

}))