import { ZodObject, type ZodRawShape, z } from 'zod/v4';

export const zDate = z.union([z.iso.datetime(), z.iso.date(), z.coerce.date()]);
export const PAGE_OFFSET_DEFAULT = 0;
export const PAGE_SIZE_DEFAULT = 20;
// your existing pagination schemas
export const PaginationOffset = z.coerce.number().int().min(0);
export const PaginationSize = z.coerce.number().int().min(1).max(100);

export const PaginationQuery = z
  .object({
    skip: PaginationOffset,
    take: PaginationSize,
  })
  .default({ skip: PAGE_OFFSET_DEFAULT, take: PAGE_SIZE_DEFAULT });
type ObjectLike = ZodRawShape | ZodObject<any> | undefined;

type ToZodObject<T extends ObjectLike> =
  T extends ZodObject<any>
    ? T
    : T extends ZodRawShape
      ? ZodObject<T>
      : undefined;

type InputConfig = {
  body?: ObjectLike;
  params?: ObjectLike;
  pagination?: boolean;
};

type OutputConfig<I extends InputConfig> = {
  body: ToZodObject<I['body']>;
  params: ToZodObject<I['params']>;
  page: I['pagination'] extends true ? typeof PaginationQuery : undefined;
};

// helper for shapes or ZodObject
export function ensureZodObject<T extends ObjectLike>(
  input: T
): ToZodObject<T> {
  if (!input) {
    return undefined as ToZodObject<T>;
  }
  if (input instanceof ZodObject) {
    return input as any as ToZodObject<T>;
  }
  return z.object(input) as any as ToZodObject<T>;
}

// The combinator
export function httpSchema<I extends InputConfig>(
  { body = undefined, params = undefined, pagination = false }: I = {} as I
) {
  return z.object(
    Object.assign(
      {},
      body ? { body: ensureZodObject(body) } : undefined,
      params ? { params: ensureZodObject(params) } : undefined,
      pagination ? { page: PaginationQuery } : undefined
    ) as any as OutputConfig<I>
  );
}
