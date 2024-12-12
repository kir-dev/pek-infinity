import { ApiProperty } from '@nestjs/swagger';
import { GroupPurpose } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class MemberUserDto {
  @ApiProperty({
    description: 'Unique identifier of the user',
    type: String,
    example: 'cjld2cjxh0000qzrmn831i7rn',
  })
  id: string;

  @ApiProperty({
    description: 'First name of the member',
    type: String,
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'Last name of the member',
    type: String,
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'Nickname of the member',
    type: String,
    example: 'Johnny',
  })
  nickname: string;
}

export class MemberListItemDto {
  @ApiProperty({
    description: 'User profile of the member',
    type: MemberUserDto,
  })
  user: MemberUserDto;
}

export class GroupListItemDto {
  @ApiProperty({
    description: 'Unique identifier of the group',
    type: String,
    example: 'cjld2cjxh0000qzrmn831i7rn',
  })
  id: string;

  @ApiProperty({
    description: 'Unique name of the group',
    type: String,
    example: 'Developers',
  })
  name: string;
}

export class GroupDto {
  @ApiProperty({
    description: 'Unique identifier of the group',
    type: String,
    example: 'cjld2cjxh0000qzrmn831i7rn',
  })
  id: string;

  @ApiProperty({
    description: 'Unique name of the group',
    type: String,
    example: 'Developers',
  })
  name: string;

  @ApiProperty({
    description: 'Description of the group purpose and activities',
    type: String,
    example: 'Group for software developers',
  })
  description: string;

  @ApiProperty({
    description: 'The primary purpose/type of the group',
    enum: GroupPurpose,
    example: GroupPurpose.GROUP,
  })
  purpose: keyof typeof GroupPurpose;

  @ApiProperty({
    description: 'Whether this group is a community',
    type: Boolean,
    example: true,
  })
  isCommunity: boolean;

  @ApiProperty({
    description: 'Whether this group is a resort',
    type: Boolean,
    example: false,
  })
  isResort: boolean;

  @ApiProperty({
    description: 'Whether this group is a task force',
    type: Boolean,
    example: false,
  })
  isTaskForce: boolean;

  @ApiProperty({
    description: 'Whether this group inherits members from child groups',
    type: Boolean,
    example: true,
  })
  hasTransitiveMembership: boolean;

  @ApiProperty({
    description: 'Children groups of this group',
    type: GroupListItemDto,
    isArray: true,
  })
  children: GroupListItemDto[];

  @ApiProperty({
    description: 'Parent group of this group',
    type: GroupListItemDto,
  })
  parent: GroupListItemDto | null;

  @ApiProperty({
    description: 'Members of this group',
    type: MemberListItemDto,
    isArray: true,
  })
  memberships: MemberListItemDto[];
}

export class CreateGroupDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsEnum(GroupPurpose)
  purpose: GroupPurpose;

  @IsBoolean()
  isCommunity: boolean;

  @IsBoolean()
  isResort: boolean;

  @IsBoolean()
  isTaskForce: boolean;

  @IsBoolean()
  hasTransitiveMembership: boolean;

  @IsBoolean()
  isArchived: boolean;
}

export class UpdateGroupDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsEnum(GroupPurpose)
  @IsOptional()
  purpose?: GroupPurpose;

  @IsBoolean()
  @IsOptional()
  isCommunity?: boolean;

  @IsBoolean()
  @IsOptional()
  isResort?: boolean;

  @IsBoolean()
  @IsOptional()
  isTaskForce?: boolean;

  @IsBoolean()
  @IsOptional()
  hasTransitiveMembership?: boolean;

  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;
}
