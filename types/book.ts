// types/book.ts

import { z } from "zod"

// ===============================================
// 楽天APIレスポンス型
// ===============================================

export type RakutenBook = {
  title: string
  titleKana?: string
  author: string
  authorKana?: string
  isbn: string
  publisherName?: string
  salesDate?: string
  seriesName?: string
  itemCaption?: string
  largeImageUrl?: string
}

// ===============================================
// フロント表示用
// ===============================================

export type BookDisplay = RakutenBook & {
  comment?: string
}

// ===============================================
// DB保存用
// ===============================================

export type BookInput = BookDisplay

// 🔹 Zodスキーマ追加
export const bookInputSchema = z.object({
  title: z.string(),
  titleKana: z.string().optional(),
  author: z.string(),
  authorKana: z.string().optional(),
  isbn: z.string(),
  publisherName: z.string().optional(),
  salesDate: z.string().optional(),
  seriesName: z.string().optional(),
  itemCaption: z.string().optional(),
  largeImageUrl: z.string().optional(),
  comment: z.string().optional()
})