import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';

import {
  CreateOrUpdateRoleDto,
  RoleDetailsDto,
  RoleDto,
  Statement,
} from './dto/access.dto';

@Injectable()
export class AccessService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findOneRole(roleId: string): Promise<RoleDetailsDto> {
    throw new Error('Method not implemented.');
  }

  async findAllRoles(): Promise<RoleDto[]> {
    throw new Error('Method not implemented.');
  }

  /**
   * Return all roles assigned to the user.
   */
  async userRoles(userId: string): Promise<RoleDto[]> {
    return userId === '123'
      ? []
      : [{ displayName: 'Site Admin', id: '##site-admin' }];
  }

  async getStatements(roles: string[]): Promise<Statement[]> {
    if (roles.includes('##site-admin')) {
      return [
        {
          resources: ['pek:profile:123', 'pek:profile:456'],
          actions: ['ProfileViewPublic', 'ProfileViewPrivate', 'ProfileEdit'],
        },
      ];
    }
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createRole(role: CreateOrUpdateRoleDto) {
    throw new Error('Method not implemented.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async updateRole(roleId: string, role: CreateOrUpdateRoleDto) {
    throw new Error('Method not implemented.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async deleteRole(roleId: string) {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async assignRole(roleId: string, userIds: string[]): Promise<void> {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async revokeRole(roleId: string, userIds: string[]): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
