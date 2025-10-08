import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '@/app.module';
import { JwtStrategy } from '@/auth/strategy/jwt.strategy';
import { PrismaService } from '@/prisma/prisma.service';
import {
  createMockJwtStrategy,
  createMockPrismaService,
} from './services-mock.util';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let mockPrismaService: ReturnType<typeof createMockPrismaService>;
  let mockJwtStrategy: ReturnType<typeof createMockJwtStrategy>;

  beforeEach(async () => {
    mockPrismaService = createMockPrismaService();
    mockJwtStrategy = createMockJwtStrategy();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
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

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
