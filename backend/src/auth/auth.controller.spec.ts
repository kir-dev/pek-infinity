import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import type express from 'express';
import { vi } from 'vitest';
import { PrismaModule } from '@/prisma/prisma.module';
import { UserService } from '@/user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  let fakejwtService: Partial<JwtService>;
  let fakeUserService: Partial<UserService>;

  beforeEach(async () => {
    fakejwtService = {
      sign: vi.fn().mockReturnValue('token'),
    };

    fakeUserService = {
      findByAuthSchId: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: fakejwtService,
        },
        {
          provide: UserService,
          useValue: fakeUserService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('oauthRedirect', () => {
    it('should create a token for the user', async () => {
      const user: Prisma.User = {
        id: 1,
        isAdmin: false,
        authSchId: '1',
        email: 'noreply@example.com',
        firstName: 'test',
        fullName: 'test user',
      };
      const res = {
        cookie: vi.fn(),
        redirect: vi.fn(),
        send: vi.fn(),
      } as any as express.Response;
      await controller.oauthRedirect(user, res);
      expect(fakejwtService.sign).toHaveBeenCalledTimes(1);
      expect(fakejwtService.sign).toHaveBeenCalledWith(user, expect.anything());
    });

    it('should include a jwt token in the url', async () => {
      const JWT_TOKEN = 'jwt-token';
      const res = {
        cookie: vi.fn(),
        redirect: vi.fn(),
        send: vi.fn(),
      } as any as express.Response;
      fakejwtService.sign = vi.fn().mockReturnValue(JWT_TOKEN);
      await controller.oauthRedirect({} as any, res);
      expect(res.cookie).toHaveBeenCalledWith(
        'jwt',
        JWT_TOKEN,
        expect.anything()
      );
    });
  });
});
