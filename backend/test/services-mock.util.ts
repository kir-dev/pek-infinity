import type { PrismaClient as TPrismaClient } from '@prisma/client/client';
import { vi } from 'vitest';
import type { JwtStrategy as TJwtStrategy } from '@/auth/strategy/jwt.strategy';

export function createMockJwtStrategy() {
  return {
    name: 'jwt',
    authenticate: vi.fn(),
    validate: vi.fn(),
    error: vi.fn(),
    pass: vi.fn(),
    fail: vi.fn(),
    redirect: vi.fn(),
    success: vi.fn(),
  } satisfies TJwtStrategy;
}

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
  return {
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
    $transaction: vi.fn(),
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $on: vi.fn(),
    $queryRaw: vi.fn(),
    $executeRaw: vi.fn(),
  } satisfies { [K in keyof TPrismaClient]: any };
}
