"use client"

// ===============================================
// 1冊分の表示コンポーネント
// ・表示専用
// ・削除ボタン
// ・編集ボタン
// 状態は持たない（親に任せる）
// ===============================================

import { Book } from "@/types/book"

type Props = {
  book: Book
  onDelete: (id: string) => void
  onEdit: (book: Book) => void
}

export default function BookItem({ book, onDelete, onEdit }: Props) {
  return (
    <div style={{ border: "1px solid #ccc", padding: 8, marginBottom: 8 }}>
      
      {/* 本のタイトル */}
      <h3>{book.title}</h3>

      {/* 著者名 */}
      <p>{book.author}</p>

      {/* 編集ボタン */}
      <button onClick={() => onEdit(book)}>
        編集
      </button>

      {/* 削除ボタン */}
      <button onClick={() => onDelete(book.id)}>
        削除
      </button>

    </div>
  )
}