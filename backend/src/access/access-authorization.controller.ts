import { Body, Delete, Get, NotFoundException, Param, Post, Put } from '@nestjs/common';

import { ApiController } from '@/utils/controller.decorator';

import { AccessService } from './access.service';
import { AuthorizationSummaryDto } from './dto/authorization-summary.dto';
import { AuthorizationEntity } from './entities/authorization.entity';
import { CreateAuthorizationDto } from './dto/create-authorization.dto';
import { UpdateAuthorizationDto } from './dto/update-authorization.dto';
import { AssignAuthorizationDto } from './dto/assign-authorization.dto';

@ApiController('access/authorization', { authStrategy: 'ENFORCED' })
export class AccessRoleController {
  constructor(private readonly accessService: AccessService) {}

  @Get()
  async findAll(): Promise<AuthorizationSummaryDto[]> {
    return this.accessService.findAll();
  }

  @Get('by-id/:id')
  async findOneById(@Param('id') roleId: string): Promise<AuthorizationEntity> {
    const result = await this.accessService.findOneById(roleId);
    if (!result) {
      throw new NotFoundException(`Authorization with id ${roleId} not found`);
    }
    return result;
  }

  @Get('by-name/:name')
  async findOneByName(@Param('name') roleName: string): Promise<AuthorizationEntity> {
    const result = await this.accessService.findOneByName(roleName);
    if (!result) {
      throw new NotFoundException(`Authorization with name ${roleName} not found`);
    }
    return result;
  }

  /**
   * Create a new named list of statements.
   * @param body 
   * @returns 
   */
  @Post()
  async create(@Body() body: CreateAuthorizationDto) {
    return this.accessService.create(body);
  }

  @Put(':id/metadata')
  async update(@Param('id') roleId: string, @Body() body: UpdateAuthorizationDto) {
    // Assuming update returns the updated authorization entity
    return this.accessService.update(roleId, body);
  }

  @Delete(':id')
  async delete(@Param('id') roleId: string) {
    return this.accessService.remove(roleId);
  }

  /**
   * Assign a list of users to this authorization.
   * @param authorizationId 
   * @param param1 
   * @returns 
   */
  @Post(':id/assignment')
  async assign(@Param('id') authorizationId: string, @Body() { userIds }: AssignAuthorizationDto) {
    return this.accessService.assign(authorizationId, userIds);
  }

  /**
   * Revoke a list of users from this authorization.
   * This is the inverse of the assign method.
   * @param authorizationId 
   * @param param1 
   * @returns 
   */
  @Delete(':id/assignment')
  async revoke(@Param('id') authorizationId: string, @Body() { userIds }: AssignAuthorizationDto) {
    return this.accessService.revoke(authorizationId, userIds);
  }
}
