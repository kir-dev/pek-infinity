import { Injectable } from '@nestjs/common';
import { Authorization } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { CodeStatementEntry } from './entities/code-statement.entity';
import { CreateCodeStatementDto } from './dto/create-code-statement.dto';

@Injectable()
export class CodeStatementService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    parentId: Authorization['id'],
    createCodeStatementDto: CreateCodeStatementDto
  ): Promise<CodeStatementEntry> {
    return this.prisma.codeDefinedStatement.create({
      data: {
        ...createCodeStatementDto,
        authId: parentId,
      },
    });
  }

  // async findAll() {
  //   return `This action returns all codeStatement`;
  // }

  async findOne(id: CodeStatementEntry['id']) {
    return await this.prisma.codeDefinedStatement.findUnique({ where: { id } });
  }

  async remove(id: CodeStatementEntry['id']) {
    return await this.prisma.codeDefinedStatement.delete({ where: { id } });
  }
}
