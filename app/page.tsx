import SearchBar from "@/features/search/components/SearchBar"
import Link from "next/link"

export default function Home() {

  return (
    <main style={{ padding: 24 }}>

      {/* 検索バー */}

      <SearchBar />

      {/* おすすめ */}

      <section style={{ marginBottom: 40 }}>
        <h2>🔥 あなたへのおすすめ</h2>

        <div style={{ display: "flex", gap: 16 }}>
          <Link href="/search">
            <div style={{ border: "1px solid #ddd", padding: 16 }}>
              仮カード
            </div>
          </Link>
        </div>
      </section>

      {/* 人気作品 */}

      <section>
        <h2>📈 人気作品</h2>

        <div style={{ display: "flex", gap: 16 }}>
          <Link href="/search">
            <div style={{ border: "1px solid #ddd", padding: 16 }}>
              仮カード
            </div>
          </Link>
        </div>
      </section>

    </main>
  )
}