// types/book.ts

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