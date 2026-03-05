// features/book/components/BookForm.tsx
"use client"

// ===============================================
// React Hook Form + Zod版
// ・フォーム状態自動管理
// ・Zodと連携
// ・エラー自動表示
// ===============================================

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { bookInputSchema, BookInput } from "@/types/book"
import { Book } from "@/types/book"

type Props = {
  onSubmit: (data: BookInput) => void
  editingBook: Book | null
  apiError?: string | null
  isLoading?: boolean
}

export default function BookForm({
  onSubmit,
  editingBook,
  apiError,
  isLoading,
}: Props) {

  // ---------------------------------------
  // React Hook Form 初期化
  // ---------------------------------------
  const {
    register,          // input登録
    handleSubmit,      // submitラッパー
    reset,             // フォームリセット
    formState: { errors },  // エラー取得
  } = useForm<BookInput>({
    resolver: zodResolver(bookInputSchema), // Zod連携
  })

  // ---------------------------------------
  // 編集モード反映
  // ---------------------------------------
  useEffect(() => {
    if (editingBook) {
      reset({
        title: editingBook.title,
        author: editingBook.author,
      })
    } else {
      reset({
        title: "",
        author: "",
      })
    }
  }, [editingBook, reset])

  // ---------------------------------------
  // UI
  // ---------------------------------------
  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ marginBottom: 20 }}>

      {/* APIエラー表示 */}
      {apiError && (
        <div style={{ color: "red", marginBottom: 10 }}>
          {apiError}
        </div>
      )}

      {/* タイトル */}
      <div>
        <input
          {...register("title")}
          placeholder="タイトル"
        />

        {errors.title && (
          <p style={{ color: "red", fontSize: 12 }}>
            {errors.title.message}
          </p>
        )}
      </div>

      {/* 著者 */}
      <div>
        <input
          {...register("author")}
          placeholder="著者"
        />

        {errors.author && (
          <p style={{ color: "red", fontSize: 12 }}>
            {errors.author.message}
          </p>
        )}
      </div>

      <button type="submit" disabled={isLoading}>
        {isLoading
          ? "送信中..."
          : editingBook
            ? "更新"
            : "追加"}
      </button>

    </form>
  )
}