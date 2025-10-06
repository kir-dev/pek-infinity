// biome-ignore lint/correctness/noUnusedImports: false positive
import type * as PrismaTypes from '@prisma/models';

declare global {
  export import type Prisma = PrismaTypes;
}
