// app/novel/[isbn]/page.tsx
import LikeButton from "@/features/like/components/LikeButton";

// SSR を強制
export const dynamic = 'force-dynamic';

// ISBN から本を取得
async function getBook(isbn: string) {
  const res = await fetch(
    `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?applicationId=${process.env.RAKUTEN_APP_ID}&isbn=${isbn}`
  );

  if (!res.ok) {
    // API がエラー返した場合
    throw new Error("書籍情報の取得に失敗しました");
  }

  const data = await res.json();

  if (!data.Items || data.Items.length === 0) {
    return null;
  }

  return data.Items[0].Item;
}

// 動的ページコンポーネント
export default async function BookPage({
  params,
}: {
  params: { isbn: string };
}) {
  const { isbn } = params; // ← await は不要

  const book = await getBook(isbn);

  if (!book) {
    return <div>本が見つかりません</div>;
  }

  return (
    <div className="book-page">
      <h1>{book.title}</h1>
      <p>{book.author}</p>

      {book.largeImageUrl && (
        <img
          src={book.largeImageUrl}
          alt={book.title}
          width={200}
          height={300}
        />
      )}

      <p>{book.itemCaption}</p>

      <LikeButton book={book} initialLiked={false} />
    </div>
  );
}