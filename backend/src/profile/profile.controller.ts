import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { UpdateBasicsDto } from '@/profile/dto/update-basics.dto';
import { UpdatePersonalDto } from '@/profile/dto/update-personal.dto';
import { UpdateProfileNameDto } from '@/profile/dto/update-profile-name.dto';

import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create(@Body() createProfileDto: CreateProfileDto) {
    return null;
    //return this.profileService.create(createProfileDto);
  }

  @Get()
  findAll() {
    return this.profileService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.profileService.findOne(id);
  }

  //TODO
  @Patch('profilename/:id')
  update(
    @Param('id') id: string,
    @Body() updateProfileNameDto: UpdateProfileNameDto,
  ) {
    return null;
    //return this.profileService.updateProfileName(id, updateProfileNameDto);
  }

  @Patch('personal/:id')
  update(
    @Param('id') id: string,
    @Body() updatePersonalDto: UpdatePersonalDto,
  ) {
    return this.profileService.updatePersonal(id, updatePersonalDto);
  }

  @Patch('basics/:id')
  update(@Param('id') id: string, @Body() updateBasicsDto: UpdateBasicsDto) {
    return this.profileService.updateBasic(id, updateBasicsDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.profileService.remove(Number(id));
  }
}
