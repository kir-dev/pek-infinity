import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { JwtStrategy } from '@/auth/strategy/jwt.strategy';
import { PrismaService } from '@/prisma/prisma.service';
import { SemesterModule } from '@/semester/semester.module';
import {
  createMockJwtStrategy,
  createMockPrismaService,
} from './services-mock.util';

describe('Semester (e2e)', () => {
  let app: INestApplication<App>;
  let mockPrismaService: ReturnType<typeof createMockPrismaService>;
  let mockJwtStrategy: ReturnType<typeof createMockJwtStrategy>;

  const VALID_SEMESTER = '2024-2025/1';
  const ANOTHER_SEMESTER = '2023-2024/1';

  function _setupPrismaState() {
    mockPrismaService.semester.findMany.mockResolvedValue([
      { name: ANOTHER_SEMESTER },
      { name: VALID_SEMESTER },
    ]);
    mockPrismaService.currentSemester.findFirst.mockResolvedValue({
      semesterName: VALID_SEMESTER,
    });
    mockPrismaService.semester.upsert.mockResolvedValue({
      name: VALID_SEMESTER,
    });
    mockPrismaService.currentSemester.deleteMany.mockResolvedValue({
      count: 1,
    });
    mockPrismaService.currentSemester.create.mockResolvedValue({
      semesterName: VALID_SEMESTER,
    });
  }

  function _mockPrismaCleanState() {
    mockPrismaService.semester.findMany.mockResolvedValue([]);
    mockPrismaService.currentSemester.findFirst.mockResolvedValue(null);
    mockPrismaService.semester.upsert.mockResolvedValue({
      name: '2000-2001/2',
    });
    mockPrismaService.currentSemester.deleteMany.mockResolvedValue({
      count: 0,
    });
    mockPrismaService.currentSemester.create.mockResolvedValue({
      semesterName: '2000-2001/2',
    });
  }

  beforeEach(async () => {
    mockPrismaService = createMockPrismaService();
    mockJwtStrategy = createMockJwtStrategy();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SemesterModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideProvider(JwtStrategy)
      .useValue(mockJwtStrategy)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('PATCH /semester/current', () => {
    const INVALID_SEMESTERS = [
      { name: 'invalid-format' },
      { name: '2024-2025' },
      { name: '24-25/1' },
      { name: '2024-2025/3' },
      { name: 'abcd-efgh/1' },
      { name: '' },
      {},
    ];

    it.each(INVALID_SEMESTERS)(
      'should reject invalid semester format: %p',
      async (invalidSemester) => {
        _setupPrismaState();

        await request(app.getHttpServer())
          .patch('/semester/current')
          .send({ name: invalidSemester })
          .expect(400);
      }
    );

    it('should accept valid semester format', async () => {
      _setupPrismaState();

      await request(app.getHttpServer())
        .patch('/semester/current')
        .send({ name: '2024-2025/1' })
        .expect(200);
    });
  });

  describe('GET /semester', () => {
    it('should return array of semesters', async () => {
      _setupPrismaState();

      const response = await request(app.getHttpServer())
        .get('/semester')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return default semester when database is empty', async () => {
      _mockPrismaCleanState();

      const response = await request(app.getHttpServer())
        .get('/semester')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toEqual(['2000-2001/2']);
    });
  });

  describe('GET /semester/current', () => {
    it('should return current semester as string', async () => {
      _mockPrismaCleanState();

      const response = await request(app.getHttpServer())
        .get('/semester/current')
        .expect(200)
        .expect('Content-Type', /text\/plain/);

      expect(typeof response.text).toBe('string');
    });
  });
});
