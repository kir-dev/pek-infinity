import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { SemesterController } from './semester.controller';
import { SemesterService } from './semester.service';

@Module({
  imports: [PrismaModule],
  controllers: [SemesterController],
  providers: [SemesterService],
})
export class SemesterModule {}
