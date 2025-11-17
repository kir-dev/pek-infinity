import 'reflect-metadata';
import { inject, injectable } from 'tsyringe';
import type z from 'zod/v4';
import { PrismaService } from '@/domains/prisma';
import { PAGE_OFFSET_DEFAULT, PAGE_SIZE_DEFAULT } from '@/utils/zod-extra';
import type {
  UserAttachUsernameDto,
  UserCreateDto,
  UserFilterDto,
} from './user.schema';

@injectable()
export class UserService {
  constructor(@inject(PrismaService) private readonly prisma: PrismaService) {}

  /**
   * Find many users with optional filters and pagination
   */
  async findMany(
    filters?: z.infer<typeof UserFilterDto>,
    {
      skip = PAGE_OFFSET_DEFAULT,
      take = PAGE_SIZE_DEFAULT,
    }: {
      skip?: number;
      take?: number;
    } = {}
  ) {
    const where: any = {};

    if (filters) {
      if (filters.humanId) {
        where.usernames = {
          some: {
            humanId: filters.humanId,
          },
        };
      }
      if (filters.createdAtFrom || filters.createdAtTo) {
        where.createdAt = {};
        if (filters.createdAtFrom) {
          where.createdAt.gte = filters.createdAtFrom;
        }
        if (filters.createdAtTo) {
          where.createdAt.lte = filters.createdAtTo;
        }
      }
    }

    const users = await this.prisma.user.findMany({
      where,
      skip,
      take,
      include: {
        usernames: {
          take: 1,
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Map to return only primary (first) username and exclude authSchId
    return users.map((user) => {
      const { authSchId: _authSchId, usernames, ...safeUser } = user;
      return {
        ...safeUser,
        primaryUsername: usernames[0] || undefined,
      };
    });
  }

  /**
   * Find a single user by ID
   */
  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        usernames: true,
        profile: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    // Exclude authSchId from response
    const { authSchId: _authSchId, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Login by AuthSch ID - find or create user and record login
   * Returns the user ID
   */
  async loginByAuthSchId(authSchId: string): Promise<string> {
    // Try to find existing user
    let user = await this.prisma.user.findUnique({
      where: { authSchId },
    });

    // Create new user if doesn't exist
    if (user) {
      // Update last login for existing user
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          lastLogin: new Date(),
          updatedAt: new Date(),
        },
      });
    } else {
      user = await this.prisma.user.create({
        data: {
          authSchId,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLogin: new Date(),
        },
      });
    }

    return user.id;
  }

  /**
   * Create a new user
   * Returns the created user object (without authSchId)
   */
  async create(data: z.infer<typeof UserCreateDto>) {
    // Check if user already exists
    const existing = await this.prisma.user.findUnique({
      where: { authSchId: data.authSchId },
    });

    if (existing) {
      throw new Error('User with this authSchId already exists');
    }

    const user = await this.prisma.user.create({
      data: {
        authSchId: data.authSchId,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
      },
      include: {
        usernames: true,
      },
    });

    // Exclude authSchId from response
    const { authSchId: _authSchId, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Attach a username to a user
   * Ensures uniqueness of humanId
   */
  async attachUsername(data: z.infer<typeof UserAttachUsernameDto>) {
    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if humanId is already taken
    const existingUsername = await this.prisma.username.findUnique({
      where: { humanId: data.humanId },
    });

    if (existingUsername) {
      throw new Error('Username already exists');
    }

    return await this.prisma.username.create({
      data: {
        humanId: data.humanId,
        userId: data.userId,
        createdAt: new Date(),
      },
    });
  }

  /**
   * Delete a user (soft delete - returns user with null profile)
   * For hard delete, use with caution considering referential integrity
   */
  async deleteUser(id: string) {
    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // For MVP, we'll just disconnect the profile (soft delete)
    // The profile field is nullable, so setting to null effectively soft-deletes
    const deletedUser = await this.prisma.user.update({
      where: { id },
      data: {
        profile: {
          disconnect: true,
        },
      },
      include: {
        usernames: true,
      },
    });

    // Exclude authSchId from response
    const { authSchId: _authSchId, ...safeUser } = deletedUser;
    return safeUser;
  }
}
