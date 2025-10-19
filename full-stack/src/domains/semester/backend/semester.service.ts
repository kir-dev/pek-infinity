import 'reflect-metadata';
import { UnprocessableEntity } from 'http-errors';
import { inject, injectable } from 'tsyringe';
import { PrismaService } from '@/domains/prisma';

export const SEMESTER_REGEX = /^20[0-9]{2}-20[0-9]{2}\/[12]$/;

export type Semester = `20${number}-20${number}/${'1' | '2'}`;

// biome-ignore lint/suspicious/noRedeclare: this is safe
export function Semester(value: null): null;
// biome-ignore lint/suspicious/noRedeclare: this is safe
export function Semester(value: string): Semester;
export function Semester(value: string | null): Semester | null {
  return value as Semester;
}

const VERY_LONG_AGO = Semester('2000-2001/2');

@injectable()
export class SemesterService {
  constructor(@inject(PrismaService) private prisma: PrismaService) {}

  async findAll(): Promise<Semester[]> {
    const results = (
      await this.prisma.semester.findMany({ orderBy: { name: 'asc' } })
    ).map((s) => Semester(s.name));

    return results.length ? results : [await this.setCurrent(VERY_LONG_AGO)];
  }

  async getCurrent(): Promise<Semester> {
    const semester = (await this.prisma.currentSemester.findFirst())
      ?.semesterName;

    return semester ? Semester(semester) : await this.setCurrent(VERY_LONG_AGO);
  }

  async setCurrent(semesterName: Semester): Promise<Semester> {
    if (!semesterName) {
      throw new UnprocessableEntity('Invalid semester');
    }

    await this.prisma.semester.upsert({
      create: { name: semesterName },
      where: { name: semesterName },
      update: {},
    });

    await this.prisma.$transaction(async (tx) => {
      await tx.currentSemester.deleteMany();
      await tx.currentSemester.create({ data: { semesterName } });
    });

    return semesterName;
  }
}
