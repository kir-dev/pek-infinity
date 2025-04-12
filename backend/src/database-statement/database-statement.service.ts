import { Injectable } from '@nestjs/common';
import { CreateDatabaseStatementDto } from './dto/create-database-statement.dto';
import { UpdateDatabaseStatementDto } from './dto/update-database-statement.dto';
import { PrismaService } from 'nestjs-prisma';
import { Authorization } from '@prisma/client';
import { DatabaseStatementEntry } from './entities/database-statement.entity';

@Injectable()
export class DatabaseStatementService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    parentId: Authorization['id'],
    createDatabaseStatementDto: CreateDatabaseStatementDto
  ) {
    return await this.prisma.dbDefinedStatement.create({
      data: {
        ...createDatabaseStatementDto,
        authId: parentId,
      },
    });
  }

  // async findAll() {
  //   return `This action returns all databaseStatement`;
  // }

  async findOne(id: DatabaseStatementEntry['id']) {
    return await this.prisma.dbDefinedStatement.findUnique({ where: { id } });
  }

  async update(
    id: DatabaseStatementEntry['id'],
    updateDatabaseStatementDto: UpdateDatabaseStatementDto
  ) {
    return await this.prisma.dbDefinedStatement.update({
      data: updateDatabaseStatementDto,
      where: { id },
    });
  }

  async remove(id: DatabaseStatementEntry['id']) {
    return await this.prisma.dbDefinedStatement.delete({ where: { id } });
  }
}
