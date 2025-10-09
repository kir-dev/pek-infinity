import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Semester } from './type/semester.type';

const VERY_LONG_AGO = Semester('2000-2001/2');

@Injectable()
export class SemesterService {
  constructor(private readonly prisma: PrismaService) {}

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
      throw new Error('Invalid semester');
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
