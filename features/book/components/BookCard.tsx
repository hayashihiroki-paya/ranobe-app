"use client"

import Link from "next/link"
import LikeButton from "@/features/like/components/LikeButton"
import { RakutenBook } from "@/types/book"

type Props = {
    book: RakutenBook
}

export default function BookCard({ book }: Props) {

    return (
        <div
            style={{
                border: "1px solid #ddd",
                padding: 16,
                marginBottom: 12,
                display: "flex",
                gap: 16
            }}
        >
            {book.largeImageUrl && (
                <img
                    src={book.largeImageUrl}
                    alt={book.title}
                    width={100}
                />
            )}

            <div>

                <h3>{book.title}</h3>

                <p>{book.author}</p>

                <div style={{ display: "flex", gap: 12 }}>

                    <Link href={`/novel/${book.isbn}`}>
                        詳細
                    </Link>

                    <LikeButton
                        book={book}
                        initialLiked={false}
                    />

                </div>

            </div>
        </div>
    )
}