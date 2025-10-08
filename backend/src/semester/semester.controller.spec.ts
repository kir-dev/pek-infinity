import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@/prisma/prisma.service';
import { createMockPrismaService } from '../../test/prisma-mock.util';
import { SemesterController } from './semester.controller';
import { SemesterService } from './semester.service';

describe('SemesterController', () => {
  let controller: SemesterController;

  beforeEach(async () => {
    const mockPrismaService = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SemesterController],
      providers: [
        SemesterService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<SemesterController>(SemesterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
