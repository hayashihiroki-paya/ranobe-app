// lib/book/createOrFindBook.ts

// ============================================
// Prisma
// ============================================

import { Prisma } from "@prisma/client"

import { BookInput } from "@/types/book"



/*
================================================
Bookを取得
なければ作成
================================================
*/

export async function createOrFindBook(
  prisma: Prisma.TransactionClient,
  input: BookInput
) {

  /*
    Book検索
  */

  let book = await prisma.book.findUnique({

    where: {
      isbn: input.isbn
    }

  })


  /*
    無ければ作成
  */

  if (!book) {

    book = await prisma.book.create({

      data: {

        isbn: input.isbn,

        title: input.title,
        titleKana: input.titleKana,

        author: input.author,
        authorKana: input.authorKana,

        publisherName: input.publisherName,
        salesDate: input.salesDate,

        seriesName: input.seriesName,

        itemCaption: input.itemCaption,

        largeImageUrl: input.largeImageUrl,

        comment: input.comment

      }

    })

  }

  return book
}