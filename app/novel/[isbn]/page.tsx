// app/novel/[isbn]/page.tsx

import BookDetailView from "@/features/book/components/BookDetailView";


export const dynamic = "force-dynamic";

async function getBook(isbn: string) {
  const res = await fetch(
    `https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?applicationId=${process.env.RAKUTEN_APP_ID}&isbn=${isbn}`
  );

  if (!res.ok) {
    throw new Error("書籍情報の取得に失敗しました");
  }

  const data = await res.json();

  if (!data.Items || data.Items.length === 0) {
    return null;
  }

  return data.Items[0].Item;
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ isbn: string }>;
}) {

  const { isbn } = await params;

  const book = await getBook(isbn);

  if (!book) {
    return <div>本が見つかりません</div>;
  }

  return (
    <BookDetailView book={book} />
  );
}