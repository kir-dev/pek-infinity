import { vi } from 'vitest';

const mockedModule = () => ({
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
    semester: mockedModule(),
    currentSemester: mockedModule(),

    $transaction: vi.fn(),
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $on: vi.fn(),
    $use: vi.fn(),
    $queryRaw: vi.fn(),
    $executeRaw: vi.fn(),
  };
}
