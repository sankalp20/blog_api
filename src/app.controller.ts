import { Controller, Get, Logger } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { AppService } from './app.service';
import { ResponseObject } from './models/response.model';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) {}

  @Get('/tags')
  @ApiOkResponse({ description: 'List all tags' })
  async findTags(): Promise<ResponseObject<'tags', string[]>> {
    this.logger.log('GET /tags endpoint called.'); 
    const tags = await this.appService.findTags();
    this.logger.log('Tags retrieved successfully:', tags); 
    return { tags };
  }
}