import {
  Body,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiQuery, ApiResponse } from '@nestjs/swagger';

import { AccessGuard } from '@/access/access.guard';
import { GroupService } from '@/group/group.service';
import { ApiController } from '@/utils/controller.decorator';

import {
  CreateGroupDto,
  GroupDto,
  GroupListItemDto,
  UpdateGroupDto,
} from './dto/group.dto';

@ApiController('group', { authStrategy: 'ENFORCED' })
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @ApiResponse({
    status: 201,
    description: 'Create group',
    type: GroupDto,
  })
  @Post()
  @UseGuards(AccessGuard.GroupCreate())
  create(@Body() createGroupDto: CreateGroupDto): Promise<GroupDto> {
    return this.groupService.create(createGroupDto);
  }

  @ApiResponse({
    status: 200,
    description: 'Get all groups',
    type: GroupListItemDto,
    isArray: true,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    type: Number,
    example: 10,
  })
  @Get()
  @UseGuards(AccessGuard.GroupFind())
  findAll(
    @Query('page') page: number,
    @Query('perPage') perPage: number,
  ): Promise<GroupListItemDto[]> {
    return this.groupService.findAll(Number(page), Number(perPage));
  }

  @ApiResponse({
    status: 200,
    description: 'Get one group',
    type: GroupDto,
  })
  @Get(':id')
  @UseGuards(AccessGuard.GroupViewDetails('id'))
  findOne(@Param('id') id: string): Promise<GroupDto> {
    return this.groupService.findById(id);
  }

  @ApiResponse({
    status: 200,
    description: 'Update group',
    type: GroupDto,
  })
  @Put(':id')
  @UseGuards(AccessGuard.GroupEditDetails('id'))
  update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ): Promise<GroupDto> {
    return this.groupService.update(id, updateGroupDto);
  }

  @ApiResponse({
    status: 204,
    description: 'Delete group',
  })
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.groupService.remove(id);
  }
}
