// lib/api.ts

// ===============================================
// API通信処理をまとめるファイル
// fetchのロジックをコンポーネントから分離することで
// 可読性・再利用性を高める
// ===============================================

import { Book, BookInput } from "@/types/book"

const BASE_URL = "/api/books"

// -------------------------------
// 本一覧取得
// -------------------------------
export async function fetchBooks(): Promise<Book[]> {
  const res = await fetch(BASE_URL)

  // エラー時は例外を投げる
  if (!res.ok) {
    throw new Error("本一覧の取得に失敗しました")
  }

  return res.json()
}

// -------------------------------
// 本作成
// -------------------------------
export async function createBook(data: BookInput) {
  const res = await fetch("/api/books", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  const json = await res.json()

  // ステータスがエラーならthrow
  if (!res.ok) {
    throw new Error(json.error || "不明なエラー")
  }

  return json
}

// -------------------------------
// 本更新
// -------------------------------
export async function updateBook(
  id: string,
  data: BookInput
): Promise<Book> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    throw new Error("本の更新に失敗しました")
  }

  return res.json()
}

// -------------------------------
// 本削除
// -------------------------------
export async function deleteBook(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  })

  if (!res.ok) {
    throw new Error("本の削除に失敗しました")
  }
}