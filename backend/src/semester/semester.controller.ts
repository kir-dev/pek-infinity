import { Body, Controller, Get, Header, Patch } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse } from '@nestjs/swagger';
import { ChangeSemesterDto } from './dto/change-semester.dto';
import { SemesterService } from './semester.service';
import { Semester } from './type/semester.type';

@Controller('semester')
export class SemesterController {
  constructor(private readonly semesterService: SemesterService) {}

  /**
   * Get all known semesters
   */
  @Get('')
  async all(): Promise<string[]> {
    return await this.semesterService.findAll();
  }

  /**
   * Get current semester
   * @returns YYYY-YYYY/X where X is the semester number
   */
  @ApiOkResponse({ content: { 'text/plain': { schema: { type: 'string' } } } })
  @Get('current')
  @Header('Content-Type', 'text/plain')
  async current(): Promise<string> {
    return await this.semesterService.getCurrent();
  }

  /**
   * Set a new semester as current.
   *
   * If the semester doesn't exist, it will be created.
   * @param param0
   * @returns the now current semester
   */
  @Patch('current')
  @Header('Content-Type', 'text/plain')
  @ApiOkResponse({ content: { 'text/plain': { schema: { type: 'string' } } } })
  @ApiBadRequestResponse({ description: 'Invalid semester' })
  async change(@Body() { name }: ChangeSemesterDto): Promise<string> {
    return await this.semesterService.setCurrent(Semester(name));
  }
}
