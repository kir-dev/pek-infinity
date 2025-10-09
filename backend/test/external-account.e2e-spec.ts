import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { ExternalAccountProtocol } from '@prisma/client';
import request from 'supertest';
import type { App } from 'supertest/types';
import { vi } from 'vitest';
import { JwtStrategy } from '@/auth/strategy/jwt.strategy';
import { ExternalAccountModule } from '@/external-account/external-account.module';
import { PrismaService } from '@/prisma/prisma.service';
import {
  createMockJwtStrategy,
  createMockPrismaService,
} from './services-mock.util';

describe('ExternalAccount (e2e)', () => {
  let app: INestApplication<App>;
  let mockPrismaService: ReturnType<typeof createMockPrismaService>;
  let mockJwtStrategy: ReturnType<typeof createMockJwtStrategy>;

  const VALID_ACCOUNTS = [
    {
      protocol: ExternalAccountProtocol.X_FORMERLY_TWITTER,
      accountName: '@testuser',
    },
    {
      protocol: ExternalAccountProtocol.TELEGRAM,
      accountName: '@testuser2',
    },
  ];

  function _setupPrismaState() {
    mockPrismaService.externalAccountLink.findMany.mockResolvedValue([
      {
        id: '1',
        protocol: ExternalAccountProtocol.X_FORMERLY_TWITTER,
        accountName: '@testuser',
        ownerId: 'user123',
      },
      {
        id: '2',
        protocol: ExternalAccountProtocol.TELEGRAM,
        accountName: '@testuser2',
        ownerId: 'user123',
      },
    ]);
    mockPrismaService.externalAccountLink.deleteMany.mockResolvedValue({
      count: 2,
    });
    mockPrismaService.externalAccountLink.createMany.mockResolvedValue({
      count: 2,
    });
    mockPrismaService.$transaction.mockResolvedValue(undefined);
  }

  function _mockPrismaCleanState() {
    mockPrismaService.externalAccountLink.findMany.mockResolvedValue([]);
    mockPrismaService.externalAccountLink.deleteMany.mockResolvedValue({
      count: 0,
    });
    mockPrismaService.externalAccountLink.createMany.mockResolvedValue({
      count: 0,
    });
    mockPrismaService.$transaction.mockResolvedValue(undefined);
  }

  beforeEach(async () => {
    mockPrismaService = createMockPrismaService();
    mockJwtStrategy = createMockJwtStrategy();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ExternalAccountModule],
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

  describe('GET /user/:userId/external-account', () => {
    it('should return array of external accounts', async () => {
      _setupPrismaState();

      const response = await request(app.getHttpServer())
        .get('/user/user123/external-account')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return empty array when no accounts exist', async () => {
      _mockPrismaCleanState();

      const response = await request(app.getHttpServer())
        .get('/user/user123/external-account')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toEqual([]);
    });
  });

  describe('PUT /user/:userId/external-account', () => {
    const INVALID_ACCOUNTS = [
      { accounts: [{ protocol: 'invalid', accountName: '@test' }] },
      {
        accounts: [
          {
            protocol: ExternalAccountProtocol.X_FORMERLY_TWITTER,
            accountName: '',
          },
        ],
      },
      { accounts: [{ protocol: ExternalAccountProtocol.X_FORMERLY_TWITTER }] },
      { accounts: 'not an array' },
      {},
    ];

    it.each(INVALID_ACCOUNTS)(
      'should reject invalid input: %p',
      async (invalidInput) => {
        _setupPrismaState();

        await request(app.getHttpServer())
          .put('/user/user123/external-account')
          .send(invalidInput)
          .expect(400);
      }
    );

    it('should accept valid accounts array', async () => {
      _setupPrismaState();

      await request(app.getHttpServer())
        .put('/user/user123/external-account')
        .send({ accounts: VALID_ACCOUNTS })
        .expect(200);
    });

    it('should accept empty accounts array', async () => {
      _mockPrismaCleanState();

      await request(app.getHttpServer())
        .put('/user/user123/external-account')
        .send({ accounts: [] })
        .expect(200);
    });

    it('should call deleteMany and-then createMany', async () => {
      mockPrismaService.externalAccountLink.deleteMany = vi
        .fn()
        .mockResolvedValue({ count: 0 });
      mockPrismaService.externalAccountLink.createMany = vi
        .fn()
        .mockResolvedValue({ count: 2 });
      mockPrismaService.$transaction = vi
        .fn()
        .mockImplementation(async (callback) => {
          await callback(mockPrismaService);
        });

      await request(app.getHttpServer())
        .put('/user/user123/external-account')
        .send({ accounts: VALID_ACCOUNTS })
        .expect(200);

      // data needs to be purged, before adding new data
      expect(
        mockPrismaService.externalAccountLink.deleteMany
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ ownerId: 'user123' }),
        })
      );

      // called with data mapped from VALID_ACCOUNTS (same length)
      expect(
        mockPrismaService.externalAccountLink.createMany
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.any(Array),
        })
      );
      expect(
        mockPrismaService.externalAccountLink.createMany.mock.calls[0][0].data
      ).toHaveLength(VALID_ACCOUNTS.length);
    });
  });
});
