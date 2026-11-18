import Image from "next/image"
import type { RakutenBook } from "@/types/book"

export default function BookDetailMetadata({ book }: { book: RakutenBook }) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-6 py-6">
      {book.largeImageUrl && (
        <Image
          src={book.largeImageUrl}
          alt={book.title}
          width={180}
          height={240}
          className="rounded-lg shadow"
        />
      )}

      <div className="space-y-2 text-sm">
        <p><b>作者</b> {book.author}</p>
        <p><b>出版社</b> {book.publisherName}</p>
        <p><b>発売日</b> {book.salesDate}</p>
      </div>
    </div>
  )
}
