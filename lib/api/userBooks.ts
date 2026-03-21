import { prisma } from "@/lib/prisma";
import { BookDisplay } from "@/types/book";

export async function getUserLikedBooks(
    userId: string
): Promise<BookDisplay[]> {
    const likes = await prisma.like.findMany({
        where: {
            userId,
        },
        include: {
            book: true,
        },
        orderBy: {
            createdAt: "desc", // 新しい順
        },
        take: 12, // 表示数は適当に
    });

    return likes.map((l) => ({
        isbn: l.book.isbn,
        title: l.book.title,
        largeImageUrl: l.book.largeImageUrl ?? undefined, // 👈 ここ
        author: l.book.author,
    }));
}