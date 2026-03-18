import { RakutenBook } from "./book"

export type RecommendBook = RakutenBook & {
  score: number
  matchCount: number
}