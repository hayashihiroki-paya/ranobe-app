// features/book/components/BookCardGrid.tsx

import BookCard from "./BookCard"
import { BookDisplay } from "@/types/book"

type Props = {
  books: BookDisplay[]
}

export default function BookCardGrid({ books }: Props) {

  return (
    <div
      className="
        grid
        gap-6
        [grid-template-columns:repeat(auto-fit,minmax(160px,160px))]

        sm:[grid-template-columns:repeat(auto-fit,minmax(160px,160px))]
        md:[grid-template-columns:repeat(auto-fit,minmax(220px,220px))]
        lg:[grid-template-columns:repeat(auto-fit,minmax(220px,220px))]
        "
    >
      {books.map((book) => (
        <BookCard
          key={book.isbn}
          book={book}
          variant="recommend"
          matchRate={book.score}
        />
      ))}
    </div>
  )
}