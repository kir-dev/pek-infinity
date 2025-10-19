import z from 'zod';

export const PaginationQuery = z.object({
  skip: z.coerce.number().int().min(0).default(0),
  take: z.coerce.number().int().min(1).max(100).default(20),
});

export const withPagination = <T extends z.ZodRawShape>(base: z.ZodObject<T>) =>
  base.extend({
    pageParam: PaginationQuery.optional(),
  });
