"use client"

import { useState } from "react"
import Link from "next/link"

type Props = {
  likes: any[]
}

export default function BookshelfTabs({ likes }: Props) {

  const [tab, setTab] = useState<"bookshelf" | "wishlist">("bookshelf")

  return (

    <div>

      {/* -----------------------------
          タブ
      ----------------------------- */}

      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 20
        }}
      >

        <button onClick={() => setTab("bookshelf")}>
          📚 マイ本棚
        </button>

        <button onClick={() => setTab("wishlist")}>
          ⭐ ウィッシュ
        </button>

      </div>


      {/* -----------------------------
         本棚
      ----------------------------- */}

      {tab === "bookshelf" && (

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, 180px)",
            gap: 20
          }}
        >

          {likes.map((like) => (

            <Link
              key={like.id}
              href={`/novel/${like.book.isbn}`}
            >

              <div>

                <img
                  src={like.book.largeImageUrl}
                  width={160}
                  alt={like.book.title}
                />

                <p>{like.book.title}</p>

                <p>{like.book.author}</p>

              </div>

            </Link>

          ))}

        </div>

      )}


      {/* -----------------------------
         ウィッシュ
      ----------------------------- */}

      {tab === "wishlist" && (

        <div>

          <p>ウィッシュはまだ未実装</p>

        </div>

      )}

    </div>

  )
}