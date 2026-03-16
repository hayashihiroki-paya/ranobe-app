import { RakutenBook } from "@/types/book"

export async function wishBook(book: RakutenBook) {

  const res = await fetch("/api/wish", {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify(book)

  })

  if (!res.ok) {
    throw new Error("wish failed")
  }

}

export async function unwishBook(isbn: string) {

  const res = await fetch(`/api/wish/${isbn}`, {

    method: "DELETE"

  })

  if (!res.ok) {
    throw new Error("unwish failed")
  }

}