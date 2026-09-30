import { z } from "zod"

export const userBookTagsQuerySchema = z.object({
  isbn: z.string().min(1),
})

export const toggleUserBookTagSchema = z.object({
  isbn: z.string().min(1),
  tagId: z.string().min(1),
})
