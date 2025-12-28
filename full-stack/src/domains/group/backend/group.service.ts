import { inject, injectable } from 'tsyringe';
import type z from 'zod/v4';
import { PrismaService } from '@/domains/prisma';
import { PAGE_OFFSET_DEFAULT, PAGE_SIZE_DEFAULT } from '@/utils/zod-extra';
import type {
  GroupCreateOrganizationDto,
  GroupCreateSubGroupDto,
  GroupUpdateConfigDto,
  GroupUpdateProfileDto,
} from './group.schema';

@injectable()
export class GroupService {
  constructor(@inject(PrismaService) private readonly prisma: PrismaService) {}

  async findMany({
    skip = PAGE_OFFSET_DEFAULT,
    take = PAGE_SIZE_DEFAULT,
  }: {
    skip?: number;
    take?: number;
  } = {}) {
    return await this.prisma.group.findMany({
      skip,
      take,
    });
  }

  async findManyInOrganization(
    organizationId: string,
    {
      skip = PAGE_OFFSET_DEFAULT,
      take = PAGE_SIZE_DEFAULT,
    }: { skip?: number; take?: number } = {}
  ) {
    return await this.prisma.group.findMany({
      where: {
        id: { startsWith: `${organizationId}@` },
      },
      skip,
      take,
    });
  }

  async findOne(id: string) {
    return await this.prisma.group.findUnique({
      where: { id },
      include: { parent: true, children: true },
    });
  }

  async updateProfile(id: string, data: z.infer<typeof GroupUpdateProfileDto>) {
    await this.prisma.group.findUniqueOrThrow({ where: { id } });
    return await this.prisma.group.update({
      where: { id },
      data,
    });
  }

  async updateConfig(id: string, data: z.infer<typeof GroupUpdateConfigDto>) {
    await this.prisma.group.findUniqueOrThrow({ where: { id } });
    return await this.prisma.group.update({
      where: { id },
      data,
    });
  }

  async changeParent(id: string, parentId: string | null) {
    await this.prisma.group.findUniqueOrThrow({ where: { id } });
    if (parentId) {
      const parentCandidate = await this.prisma.group.findUnique({
        where: { id: parentId },
      });
      if (!parentCandidate) {
        throw new Error('Parent group not found');
      }
      if (parentCandidate.isArchived) {
        throw new Error('Parent group is archived');
      }

      const { ok, archived, error } = await this._checkCircularHierarchy(
        id,
        parentId
      );
      if (archived) {
        throw new Error(`Parent group is archived: ${error}`);
      }
      if (!ok) {
        throw new Error(`Circular hierarchy detected: ${error}`);
      }
    }
    return await this.prisma.group.update({
      where: { id },
      data: { parentId },
    });
  }

  private async _checkCircularHierarchy(
    groupId: string,
    potentialParentId: string,
    remDepth: number = 10
  ): Promise<{ ok: boolean; archived: boolean; error?: string }> {
    if (remDepth <= 0) {
      return { ok: false, archived: false, error: 'loop detected' };
    }

    const parent = await this.prisma.group.findUnique({
      where: { id: potentialParentId },
    });

    if (parent) {
      if (parent.isArchived) {
        return {
          ok: false,
          archived: true,
          error: `parent group is archived: ${potentialParentId}`,
        };
      }
      if (parent.parentId === null) {
        return { ok: true, archived: false };
      }
      return await this._checkCircularHierarchy(
        groupId,
        parent.parentId!,
        remDepth - 1
      );
    } else {
      return { ok: true, archived: false };
    }
  }

  async createSubGroup(
    parentId: string,
    createSubGroupDto: z.infer<typeof GroupCreateSubGroupDto>
  ) {
    if (!parentId) {
      throw new Error('Subgroup must have a parent');
    }

    const { idJustName, ...allData } = createSubGroupDto;
    const organization = parentId.split('@')[0];
    if (!organization) {
      throw new Error('Invalid parent group ID format');
    }
    const groupId = `${organization}@${idJustName}`;

    const parentCandidate = await this.prisma.group.findUnique({
      where: { id: parentId },
    });

    if (!parentCandidate) {
      throw new Error('Parent group not found');
    }
    if (parentCandidate.isArchived) {
      throw new Error('Parent group is archived');
    }

    const { ok, archived, error } = await this._checkCircularHierarchy(
      groupId,
      parentId
    );

    if (archived) {
      throw new Error(`Parent group is archived: ${error}`);
    }
    if (!ok) {
      throw new Error(`Circular hierarchy detected: ${error}`);
    }

    return await this.prisma.group.create({
      data: { ...allData, id: groupId, parentId, isArchived: false },
    });
  }

  async createOrganization(data: z.infer<typeof GroupCreateOrganizationDto>) {
    return await this.prisma.group.create({
      data: {
        ...data,
        isArchived: false,
        parentId: null,
        id: `${data.idJustName}@${data.idJustName}`,
      },
    });
  }

  async archive(id: string) {
    await this.prisma.group.findUniqueOrThrow({ where: { id } });
    return await this.prisma.group.update({
      where: { id },
      data: { isArchived: true },
    });
  }
}
