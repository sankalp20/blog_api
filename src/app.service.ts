import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TagEntity } from './entities/tag.entity';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(
    @InjectRepository(TagEntity) private tagRepo: Repository<TagEntity>,
  ) {}

  async findTags(): Promise<string[]> {
    this.logger.log('Fetching tags from database.'); 
    const tags = await this.tagRepo.find();
    return tags.map(tag => tag.tag);
  }
}