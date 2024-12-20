import { Body, Delete, Get, Param, Post, Put } from '@nestjs/common';

import { ApiController } from '@/utils/controller.decorator';

import { AccessService } from './access.service';
import {
  CreateOrUpdateRoleDto,
  RoleAssignmentDto,
  RoleDetailsDto,
  RoleDto,
} from './dto/access.dto';

@ApiController('access/role', { authStrategy: 'ENFORCED' })
export class AccessRoleController {
  constructor(private readonly accessService: AccessService) {}

  @Get()
  async findAll(): Promise<RoleDto[]> {
    return this.accessService.findAllRoles();
  }

  @Get(':id')
  async findOne(@Param('id') roleId: string): Promise<RoleDetailsDto> {
    return this.accessService.findOneRole(roleId);
  }

  @Post()
  async create(@Body() body: CreateOrUpdateRoleDto) {
    return this.accessService.createRole(body);
  }

  @Put(':id')
  async update(
    @Param('id') roleId: string,
    @Body() role: CreateOrUpdateRoleDto,
  ) {
    return this.accessService.updateRole(roleId, role);
  }

  @Delete(':id')
  async delete(@Param('id') roleId: string) {
    return this.accessService.deleteRole(roleId);
  }

  @Post(':id/assignment')
  async assign(
    @Param('id') roleId: string,
    @Body() { userIds }: RoleAssignmentDto,
  ) {
    return this.accessService.assignRole(roleId, userIds);
  }

  @Delete(':id/assignment')
  async revoke(
    @Param('id') roleId: string,
    @Body() { userIds }: RoleAssignmentDto,
  ) {
    return this.accessService.revokeRole(roleId, userIds);
  }
}
