// features/book/components/BookCardGrid.tsx

import BookCard from "./BookCard"
import { BookDisplay } from "@/types/book"

type Props = {
  books: BookDisplay[]
}

export default function BookCardGrid({ books }: Props) {

  return (
    <div className="
      grid
      grid-cols-2
      sm:grid-cols-3
      md:grid-cols-4
      lg:grid-cols-5
      gap-6
    ">
      {books.map(book => (
        <BookCard
          key={book.isbn}
          book={book}
          variant="recommend"
          matchRate={book.score} // ⭐ ここ追加
        />
      ))}
    </div>
  )
}