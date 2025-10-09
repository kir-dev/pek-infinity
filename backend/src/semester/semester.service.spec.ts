import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { PrismaService } from '@/prisma/prisma.service';
import { createMockPrismaService } from '../../test/services-mock.util';
import { SemesterService } from './semester.service';

describe('SemesterService', () => {
  let service: SemesterService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(async () => {
    const mockPrismaService = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SemesterService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SemesterService>(SemesterService);
    prisma = mockPrismaService;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all semesters sorted by name', async () => {
      const semesters = [
        { name: '2023-2024/1' },
        { name: '2024-2025/1' },
        { name: '2024-2025/2' },
      ];
      prisma.semester.findMany.mockResolvedValue(semesters);

      const result = await service.findAll();

      expect(prisma.semester.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(['2023-2024/1', '2024-2025/1', '2024-2025/2']);
    });

    it('should return default semester when no semesters exist', async () => {
      prisma.semester.findMany.mockResolvedValue([]);
      const setCurrentSpy = vi
        .spyOn(service, 'setCurrent')
        .mockResolvedValue('2000-2001/2');

      const result = await service.findAll();

      expect(prisma.semester.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
      expect(setCurrentSpy).toHaveBeenCalledWith('2000-2001/2');
      expect(result).toEqual(['2000-2001/2']);
    });
  });

  describe('getCurrent', () => {
    it('should return the current semester when one exists', async () => {
      const currentSemester = { semesterName: '2024-2025/1' };
      prisma.currentSemester.findFirst.mockResolvedValue(currentSemester);

      const result = await service.getCurrent();

      expect(prisma.currentSemester.findFirst).toHaveBeenCalled();
      expect(result).toBe('2024-2025/1');
    });

    it('should set and return default semester when no current semester exists', async () => {
      prisma.currentSemester.findFirst.mockResolvedValue(null);
      const setCurrentSpy = vi
        .spyOn(service, 'setCurrent')
        .mockResolvedValue('2000-2001/2');

      const result = await service.getCurrent();

      expect(prisma.currentSemester.findFirst).toHaveBeenCalled();
      expect(setCurrentSpy).toHaveBeenCalledWith('2000-2001/2');
      expect(result).toBe('2000-2001/2');
    });
  });

  describe('setCurrent', () => {
    it('should set the current semester and return it', async () => {
      const semesterName = '2024-2025/1';

      const result = await service.setCurrent(semesterName);

      expect(prisma.semester.upsert).toHaveBeenCalledWith({
        create: { name: semesterName },
        where: { name: semesterName },
        update: {},
      });
      expect(prisma.currentSemester.deleteMany).toHaveBeenCalledWith();
      expect(prisma.currentSemester.create).toHaveBeenCalledWith({
        data: { semesterName },
      });
      expect(result).toBe(semesterName);
    });

    it('should throw InternalServerErrorException for invalid semester', async () => {
      await expect(service.setCurrent(null as any)).rejects.toThrow(
        'Invalid semester'
      );
      await expect(service.setCurrent('' as any)).rejects.toThrow(
        'Invalid semester'
      );
    });
  });
});
