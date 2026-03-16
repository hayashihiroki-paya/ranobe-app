import { create } from "zustand"

type WishState = {

  wished: Set<string>

  isWished: (isbn: string) => boolean

  wish: (isbn: string) => void

  unwish: (isbn: string) => void

}

export const useWishStore = create<WishState>((set, get) => ({

  wished: new Set(),

  isWished: (isbn) => {
    return get().wished.has(isbn)
  },

  wish: (isbn) => {

    const next = new Set(get().wished)
    next.add(isbn)

    set({ wished: next })

  },

  unwish: (isbn) => {

    const next = new Set(get().wished)
    next.delete(isbn)

    set({ wished: next })

  }

}))