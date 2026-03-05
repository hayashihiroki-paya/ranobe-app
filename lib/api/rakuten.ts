export async function searchBooks(title: string) {

  const res = await fetch(`/api/rakuten/search?title=${title}`)

  if (!res.ok) {
    throw new Error("検索失敗")
  }

  return res.json()
}