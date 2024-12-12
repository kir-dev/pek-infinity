import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';

import {
  CreateGroupDto,
  GroupDto,
  GroupListItemDto,
  UpdateGroupDto,
} from '@/group/dto/group.dto';

const GroupListItemDtoSelect = {
  id: true,
  name: true,
} satisfies Prisma.GroupSelect;

const GroupDtoSelect = {
  id: true,
  name: true,
  description: true,
  purpose: true,
  isCommunity: true,
  isResort: true,
  isTaskForce: true,
  hasTransitiveMembership: true,
  children: {
    select: GroupListItemDtoSelect,
  },
  parent: {
    select: GroupListItemDtoSelect,
  },
  memberships: {
    select: {
      id: true,
      flairs: true,
      statuses: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          nickname: true,
        },
      },
    },
  },
} satisfies Prisma.GroupSelect;

@Injectable()
export class GroupService {
  private readonly logger = new Logger(GroupService.name);
  constructor(private prisma: PrismaService) {}

  async create({
    parentId,
    ...createGroupDto
  }: CreateGroupDto): Promise<GroupDto> {
    return this.prisma.group.create({
      data: {
        ...createGroupDto,
        parent: parentId ? { connect: { id: parentId } } : undefined,
      },
      select: GroupDtoSelect,
    });
  }

  async findAll(page: number, perPage: number): Promise<GroupListItemDto[]> {
    return this.prisma.group.findMany({
      where: {
        isArchived: false,
      },
      select: GroupListItemDtoSelect,
      skip: (page - 1) * perPage,
      take: perPage,
    });
  }

  async findById(id: string): Promise<GroupDto> {
    const group = await this.prisma.group.findUnique({
      where: { id },
      select: GroupDtoSelect,
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    return group;
  }

  async update(id: string, updateGroupDto: UpdateGroupDto): Promise<GroupDto> {
    try {
      return this.prisma.group.update({
        where: { id },
        data: updateGroupDto,
        select: GroupDtoSelect,
      });
    } catch (error) {
      this.logger.error(error);
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.group.delete({
        where: { id },
      });
    } catch (error) {
      this.logger.error(error);
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
  }
}
