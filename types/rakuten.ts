// ===============================================
// 楽天Books API レスポンス型
// ===============================================

export type RakutenBookItem = {
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

export type RakutenBookResponse = {
  Items: {
    Item: RakutenBookItem
  }[]
}