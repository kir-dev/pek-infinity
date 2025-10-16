import type { PrismaClient as TPrismaClient } from '@prisma/client';
import { vi } from 'vitest';

const mockPrismaModel = () => ({
  findMany: vi.fn(),
  findUnique: vi.fn(),
  findFirst: vi.fn(),
  create: vi.fn(),
  createMany: vi.fn(),
  update: vi.fn(),
  updateMany: vi.fn(),
  upsert: vi.fn(),
  delete: vi.fn(),
  deleteMany: vi.fn(),
  count: vi.fn(),
  aggregate: vi.fn(),
  groupBy: vi.fn(),
});

export function createMockPrismaService() {
  const result = {
    semester: mockPrismaModel(),
    currentSemester: mockPrismaModel(),
    username: mockPrismaModel(),
    user: mockPrismaModel(),
    group: mockPrismaModel(),
    membership: mockPrismaModel(),
    entryAwardRequest: mockPrismaModel(),
    evaluation: mockPrismaModel(),
    externalAccountLink: mockPrismaModel(),
    guideline: mockPrismaModel(),
    guidelineCollection: mockPrismaModel(),
    membershipStatus: mockPrismaModel(),
    notification: mockPrismaModel(),
    pointHistory: mockPrismaModel(),
    pointRequest: mockPrismaModel(),
    policy: mockPrismaModel(),
    policyAssignment: mockPrismaModel(),
    profile: mockPrismaModel(),
    scoreboard: mockPrismaModel(),
    statement: mockPrismaModel(),
    $executeRawUnsafe: vi.fn(),
    $extends: vi.fn(),
    $queryRawUnsafe: vi.fn(),
    $transaction: vi
      .fn()
      .mockImplementation((cbOrArray) =>
        Array.isArray(cbOrArray)
          ? cbOrArray.map((cb) => cb(result))
          : cbOrArray(result)
      ),
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $on: vi.fn(),
    $queryRaw: vi.fn(),
    $executeRaw: vi.fn(),
  } satisfies { [K in keyof TPrismaClient]: any };
  return result;
}
