import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@/prisma/prisma.service';
import { createMockPrismaService } from '../../test/services-mock.util';
import { ExternalAccountController } from './external-account.controller';
import { ExternalAccountService } from './external-account.service';

describe('ExternalAccountController', () => {
  let controller: ExternalAccountController;

  beforeEach(async () => {
    const mockPrismaService = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExternalAccountController],
      providers: [
        ExternalAccountService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<ExternalAccountController>(
      ExternalAccountController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
