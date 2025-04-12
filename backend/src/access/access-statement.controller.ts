import {
  Body,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  NotImplementedException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { ApiController } from '@/utils/controller.decorator';
import { AccessService } from './access.service';
import { CreateDbStatementDto } from './dto/create-db-statement.dto';
import { CreateCodeStatementDto } from './dto/create-code-statement.dto';
import { UpdateDbStatementDto } from './dto/update-db-statement.dto';
import { UpdateCodeStatementDto } from './dto/update-code-statement.dto';
// import { AssignStatementDto } from './dto/assign-statement.dto'; // DTO doesn't exist, purpose unclear

@ApiController('access/statement', { authStrategy: 'ENFORCED' })
export class AccessStatementController {
  constructor(private readonly accessService: AccessService) {}

  /**
   * Create a new statement which is entirely stored in the database.
   * @param body 
   * @returns The created statement.
   */
  @Post('db')
  async createDbStatement(@Body() body: CreateDbStatementDto) {
    // Assuming createDbStatement returns the created statement
    return await this.accessService.createDbStatement(body);
  }

  /**
   * 
   * @param statementId 
   * @param statement actions + resources
   * @returns 
   */
  @Put('db/:id')
  async updateDbStatement(
    @Param('id') statementId: string,
    @Body() statement: UpdateDbStatementDto
  ) {
    // Assuming updateDbStatement returns the updated statement
    return this.accessService.updateDbStatement(statementId, statement);
  }

  /**
   * Create a new statement, where only the parameters are stored in the database.
   * The actual statement is calculated at runtime.
   * @param body 
   * @returns 
   */
  @Post('code')
  async createCodeStatement(@Body() body: CreateCodeStatementDto) {
    // Assuming createCodeStatement returns the created statement
    return this.accessService.createCodeStatement(body);
  }

  @Put('code/:id')
  async updateCodeStatement(
    @Param('id') statementId: string,
    @Body() statement: UpdateCodeStatementDto
  ) {
    // Assuming updateCodeStatement returns the updated statement
    return this.accessService.updateCodeStatement(statementId, statement);
  }

  // --- General Statement Deletion ---

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') statementId: string): Promise<void> {
    await this.accessService.deleteStatement(statementId);
  }

  // --- Assign/Revoke (Purpose Unclear - Commented Out) ---
  /*
  @Post(':id/assign')
  async assign(
    @Param('id') statementId: string,
    @Body() body: any, // Replace with appropriate DTO if purpose is clarified
  ) {
    // TODO: Clarify purpose. Assign statement to what? Users? Roles?
    // If linking to Role, need Role ID. If applying to user, need User IDs.
    // Current service methods don't support this directly.
    throw new NotImplementedException('Assign statement functionality not implemented/clarified.');
    // Example: return this.accessService.linkStatementToAuthorization(statementId, body.authorizationId);
  }

  @Delete(':id/assign') // Changed from Post(':id/revoke') for consistency if it's unlinking
  async revoke(
    @Param('id') statementId: string,
    @Body() body: any, // Replace with appropriate DTO if purpose is clarified
  ) {
    // TODO: Clarify purpose. Revoke statement from what?
    throw new NotImplementedException('Revoke statement functionality not implemented/clarified.');
     // Example: return this.accessService.unlinkStatementFromAuthorization(statementId, body.authorizationId);
  }
  */
}
