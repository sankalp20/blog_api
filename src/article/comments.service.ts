import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CommentEntity } from 'src/entities/comment.entity';
import { UserEntity } from 'src/entities/user.entity';
import { CreateCommentDTO, CommentResponse } from 'src/models/comment.model';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(
    @InjectRepository(CommentEntity)
    private commentRepo: Repository<CommentEntity>,
  ) {}

  async findByArticleSlug(slug: string): Promise<CommentResponse[]> {
    this.logger.log(`Fetching comments for article with slug: ${slug}`);
    const comments = await this.commentRepo.find({
      where: { article: { slug } },
      relations: ['author'], // Include 'author' relation to get user details
    });
    return comments.map(comment => comment.toJSON());
  }

  async findById(id: number): Promise<CommentResponse> {
    this.logger.log(`Fetching comment with ID: ${id}`);
    const comment = await this.commentRepo.findOne({ where: { id } });
    return comment ? comment.toJSON() : null;
  }

  async createComment(user: UserEntity, data: CreateCommentDTO): Promise<CommentResponse> {
    this.logger.log(`Creating comment for user: ${user.username}`);
    const comment = this.commentRepo.create({ ...data, author: user });
    await comment.save();
    return comment.toJSON();
  }

  async deleteComment(user: UserEntity, id: number): Promise<CommentResponse> {
    this.logger.log(`Deleting comment with ID: ${id} by user: ${user.username}`);
    const comment = await this.commentRepo.findOne({ where: { id, author: user } });
    if (!comment) {
      this.logger.warn(`Comment with ID ${id} not found for deletion`);
      return null; // Return null if comment not found or user is not the author
    }
    await this.commentRepo.remove(comment);
    return comment.toJSON();
  }
}
