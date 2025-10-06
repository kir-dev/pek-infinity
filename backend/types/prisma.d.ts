// biome-ignore lint/correctness/noUnusedImports: false positive
import type * as PrismaTypes from '@prisma/client';

declare global {
  export import type Prisma = PrismaTypes;
}
