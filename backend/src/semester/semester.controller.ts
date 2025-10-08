import { Body, Controller, Get, Header, Patch } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse } from '@nestjs/swagger';
import { ChangeSemesterDto } from './dto/change-semester.dto';
import { SemesterService } from './semester.service';
import { Semester } from './type/semester.type';

@Controller('semester')
export class SemesterController {
  constructor(private readonly semesterService: SemesterService) {}

  @Get('')
  async all(): Promise<string[]> {
    return await this.semesterService.findAll();
  }

  @ApiOkResponse({ content: { 'text/plain': { schema: { type: 'string' } } } })
  @Get('current')
  @Header('Content-Type', 'text/plain')
  async current(): Promise<string> {
    return await this.semesterService.getCurrent();
  }

  @Patch('current')
  @Header('Content-Type', 'text/plain')
  @ApiOkResponse({ content: { 'text/plain': { schema: { type: 'string' } } } })
  @ApiBadRequestResponse({ description: 'Invalid semester' })
  async change(@Body() { name }: ChangeSemesterDto): Promise<string> {
    return await this.semesterService.setCurrent(Semester(name));
  }
}
