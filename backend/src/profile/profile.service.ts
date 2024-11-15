import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { UpdateExternalAccountLinksDto } from '@/profile/dto/update-external-account-links.dto';

import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaClient) {}
  /*async create(createProfileDto: CreateProfileDto, authSchId: string) {
    return await this.prisma.user.create({
      data: { ...createProfileDto, authSchId: authSchId },
    });
  }*/

  async findAll() {
    return await this.prisma.user.findMany();
  }

  async findOne(userAuthSchId: string) {
    return await this.prisma.user.findUnique({
      where: { authSchId: userAuthSchId },
    });
  }

  async updateProfileName(authSchId: string) {}
  async updateBasic(authSchId: string, updateProfileDto: UpdateProfileDto) {
    return await this.prisma.user.update({
      where: { authSchId: authSchId },
      data: {
        ...updateProfileDto,
      },
    });
  }

  async updatePesonal() {}

  async updateExternalLinks(
    authSchId: string,
    { links }: UpdateExternalAccountLinksDto,
  ) {
    await this.prisma.externalAccountLink.delete({
      where: { owner: { authSchId: authSchId } },
    });

    //    return await this.prisma.user.update({
    //      where: { authSchId: autSchId },
    //      data: {
    //        externalAccounts: [{ upsert }],
    // },
    //});
  }
}
