import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateExternalAccountBatchDto } from './dto/external-account.dto';
import { ExternalAccountService } from './external-account.service';

@ApiTags('User')
@Controller('/user/:userId/external-account')
export class ExternalAccountController {
  constructor(
    private readonly externalAccountService: ExternalAccountService
  ) {}

  /**
   * Get all linked external accounts of this user
   * @param userId
   * @returns
   */
  @Get()
  async get(@Param('userId') userId: string) {
    return await this.externalAccountService.findAll(userId);
  }

  /**
   * Update the external accounts of this user in batch
   * @param userId
   * @param updateExternalAccountBatchDto
   * @returns
   */
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Put()
  async updateBatch(
    @Param('userId') userId: string,
    @Body() updateExternalAccountBatchDto: UpdateExternalAccountBatchDto
  ) {
    try {
      return await this.externalAccountService.updateBatch(
        userId,
        updateExternalAccountBatchDto.accounts
      );
    } catch (error: any) {
      if (error?.code === 'P2003') {
        throw new NotFoundException();
      }
      throw error;
    }
  }
}
