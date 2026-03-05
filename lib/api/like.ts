// lib/api/like.ts
import { RakutenBook } from "@/types/book"

// Like
export async function likeBook(book: RakutenBook) {

  const res = await fetch("/api/like", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(book)
  })

  if (!res.ok) {
    throw new Error("Like失敗")
  }

  return res.json()
}

// Unlike
export async function unlikeBook(isbn: string) {

  const res = await fetch(`/api/like?isbn=${isbn}`, {
    method: "DELETE"
  })

  if (!res.ok) {
    throw new Error("Unlike失敗")
  }
}