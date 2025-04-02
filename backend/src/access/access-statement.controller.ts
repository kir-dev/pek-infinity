import { Body, Delete, Get, Param, Post, Query } from '@nestjs/common';

import { ApiController } from '@/utils/controller.decorator';

import { AccessService } from './access.service';
import {
  AssignstatementDto,
  CreateOrUpdatestatementDto,
  statementDto,
} from './dto/access.dto';

@ApiController('access/statement', { authStrategy: 'ENFORCED' })
export class AccessStatementController {
  constructor(private readonly accessService: AccessService) {}

  @Post()
  async create(@Body() body: CreateOrUpdateStatementDto) {
    return this.accessService.createStatement(body);
  }

  @Post(':id')
  async update(
    @Param('id') statementId: string,
    @Body() statement: CreateOrUpdateStatementDto,
  ) {
    return this.accessService.updateStatement(statementId, statement);
  }

  @Delete(':id')
  async delete(@Param('id') statementId: string) {
    return this.accessService.deleteStatement(statementId);
  }

  @Post(':id/assign')
  async assign(
    @Param('id') statementId: string,
    @Body() { userIds }: AssignstatementDto,
  ) {
    return this.accessService.assignStatement(statementId, userIds);
  }

  @Post(':id/revoke')
  async revoke(
    @Param('id') statementId: string,
    @Body() { userIds }: AssignstatementDto,
  ) {
    return this.accessService.revokeStatement(statementId, userIds);
  }
}
