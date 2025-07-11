import { type ZodSchema, z } from "zod/v4"

export function createPageSchema<T>(schema: ZodSchema<T>) {
  return z.object({
    data: z.object({
      Page: z
        .object({
          pageInfo: pageInfoSchema,
        })
        .and(schema),
    }),
  })
}

export const pageInfoSchema = z.object({
  total: z.number(),
  perPage: z.number(),
  currentPage: z.number(),
  lastPage: z.number(),
  hasNextPage: z.boolean(),
})

export function getDefaultCreatedAfter() {
  return new Date(new Date().getTime() - 1000 * 5)
}
