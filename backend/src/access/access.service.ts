// import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'nestjs-prisma';
import { AuthorizationEntity } from './entities/authorization.entity';
import { AssignAuthorizationDto } from './dto/assign-authorization.dto';
import { AuthorizationSummaryDto } from './dto/authorization-summary.dto';
import { CreateAuthorizationDto } from './dto/create-authorization.dto';
import { CreateDbStatementDto } from './dto/create-db-statement.dto';
import { CreateCodeStatementDto } from './dto/create-code-statement.dto';
import { UpdateDbStatementDto } from './dto/update-db-statement.dto';
import { UpdateCodeStatementDto } from './dto/update-code-statement.dto';
import { UpdateAuthorizationDto } from './dto/update-authorization.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AccessService {
  constructor(
    // @Inject(CACHE_MANAGER) private cache: Cache,
    private readonly prisma: PrismaService
  ) {}

  async create(data: CreateAuthorizationDto): Promise<undefined> {
    await this.prisma.authorization.create({
      data,
    });
  }

  async findOneById(id: AuthorizationEntity['id']): Promise<AuthorizationEntity | null> {
    return await this.prisma.authorization.findUnique({
      where: { id },
      include: { codeDefined: true, dbDefined: true },
    });
  }

  async findOneByName(name: AuthorizationEntity['name']): Promise<AuthorizationEntity | null> {
    return await this.prisma.authorization.findUnique({
      where: { name },
      include: { codeDefined: true, dbDefined: true },
    });
  }

  async findAll(): Promise<AuthorizationSummaryDto[]> {
    return await this.prisma.authorization.findMany({});
  }

  /**
   * Return all authorizations of a user.
   */
  async findByAssignedToUser(userId: string): Promise<AuthorizationEntity[]> {
    return await this.prisma.authorization.findMany({
      where: { authorizedUsers: { some: { id: userId } } },
      include: { codeDefined: true, dbDefined: true },
    });
  }

  // async getStatements({ codeDefined, dbDefined }: AuthorizationEntity) {
  //   return []; // TODO
  // }

  async assign(authorizationId: AuthorizationEntity['id'], users: string[]): Promise<void> {
    await this.prisma.authorization.update({
      where: { id: authorizationId },
      data: {
        authorizedUsers: {
          connect: users.map((id) => ({ id })),
        },
      },
    });
  }

  async revoke(authorizationId: AuthorizationEntity['id'], users: string[]): Promise<void> {
    await this.prisma.authorization.update({
      where: { id: authorizationId },
      data: {
        authorizedUsers: {
          disconnect: users.map((id) => ({ id })),
        },
      },
    });
  }

  async update(authorizationId: AuthorizationEntity['id'], data: UpdateAuthorizationDto) {
    try {
      return await this.prisma.authorization.update({
        where: { id: authorizationId },
        data, // Only updates fields present in the DTO (name, defaultEnabled)
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Authorization with ID ${authorizationId} not found.`);
      }
      // Handle potential unique constraint violation for 'name' if needed
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        // This assumes 'name' is the only unique field being updated
        throw new Error(`Authorization name '${data.name}' already exists.`);
      }
      throw error;
    }
  }

  async remove(authorizationId: AuthorizationEntity['id']): Promise<void> {
    // Note: This will fail if statements still reference this authorization due to relation constraints.
    // Consider deleting related statements first or handling the constraint violation.
    await this.prisma.authorization.delete({ where: { id: authorizationId } });
  }

  // --- Statement Management ---

  async createDbStatement(data: CreateDbStatementDto) {
    // Ensure the referenced Authorization exists
    const authExists = await this.prisma.authorization.findUnique({ where: { id: data.authId } });
    if (!authExists) {
      throw new NotFoundException(`Authorization with ID ${data.authId} not found.`);
    }
    return await this.prisma.dbDefinedStatement.create({ data });
  }

  async createCodeStatement(data: CreateCodeStatementDto) {
    // Ensure the referenced Authorization exists
    const authExists = await this.prisma.authorization.findUnique({ where: { id: data.authId } });
    if (!authExists) {
      throw new NotFoundException(`Authorization with ID ${data.authId} not found.`);
    }
    return await this.prisma.codeDefinedStatement.create({ data });
  }

  async updateDbStatement(statementId: string, data: UpdateDbStatementDto) {
    try {
      return await this.prisma.dbDefinedStatement.update({
        where: { id: statementId },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`DbDefinedStatement with ID ${statementId} not found.`);
      }
      throw error;
    }
  }

  async updateCodeStatement(statementId: string, data: UpdateCodeStatementDto) {
    try {
      return await this.prisma.codeDefinedStatement.update({
        where: { id: statementId },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`CodeDefinedStatement with ID ${statementId} not found.`);
      }
      throw error;
    }
  }

  async deleteStatement(statementId: string): Promise<void> {
    // Try deleting from both types, ignore 'Record not found' errors (P2025)
    try {
      await this.prisma.dbDefinedStatement.delete({ where: { id: statementId } });
      return; // Found and deleted in dbDefinedStatement
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025')) {
        throw error; // Re-throw unexpected errors
      }
    }

    try {
      await this.prisma.codeDefinedStatement.delete({ where: { id: statementId } });
      return; // Found and deleted in codeDefinedStatement
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        // If not found in either table, throw NotFoundException
        throw new NotFoundException(`Statement with ID ${statementId} not found.`);
      }
      throw error; // Re-throw unexpected errors
    }
  }

  // TODO: Implement logic for assignStatement/revokeStatement if needed
  // These might involve linking/unlinking statements to authorizations,
  // but the current schema links statements via authId on creation.
  // Clarification needed on the exact purpose of these controller methods.
}
