import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleEntity } from '../entities/article.entity';
import { CommentEntity } from '../entities/comment.entity';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class AdminService {
    private readonly logger = new Logger(AdminService.name);
    constructor(
        @InjectRepository(ArticleEntity)
        private readonly blogRepository: Repository<ArticleEntity>,
        @InjectRepository(CommentEntity)
        private readonly commentRepository: Repository<CommentEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) { }

    // Method to archive a blog
  async archiveBlog(blogId: number): Promise<void> {
    try {
      await this.blogRepository.update(blogId, { archived: true } as Partial<ArticleEntity>);
    } catch (error) {
      // Log error if any occurs during archiving
      this.logger.error(`Error archiving blog with ID ${blogId}`, error.stack);
      throw error;
    }
  }

  // Method to archive a comment
  async archiveComment(commentId: number): Promise<void> {
    try {
      await this.commentRepository.update(commentId, { archived: true } as Partial<CommentEntity>);
    } catch (error) {
      // Log error if any occurs during archiving
      this.logger.error(`Error archiving comment with ID ${commentId}`, error.stack);
      throw error;
    }
  }

  // Method to archive a user
  async archiveUser(userId: number): Promise<void> {
    try {
      await this.userRepository.update(userId, { archived: true } as Partial<UserEntity>);
    } catch (error) {
      // Log error if any occurs during archiving
      this.logger.error(`Error archiving user with ID ${userId}`, error.stack);
      throw error;
    }
  }

  // Method to get count of blogs written on a specific date
  async getBlogsWrittenOnDate(date: Date): Promise<number> {
    try {
      return this.blogRepository.createQueryBuilder('blog')
        .where('blog.createdAt = :date', { date })
        .getCount();
    } catch (error) {
      // Log error if any occurs while fetching blogs
      this.logger.error(`Error getting blogs written on ${date}`, error.stack);
      throw error;
    }
  }

  // Method to get count of comments made on a specific date
  async getCommentsMadeOnDate(date: Date): Promise<number> {
    try {
      return this.commentRepository.createQueryBuilder('comment')
        .where('comment.createdAt = :date', { date })
        .getCount();
    } catch (error) {
      // Log error if any occurs while fetching comments
      this.logger.error(`Error getting comments made on ${date}`, error.stack);
      throw error;
    }
  }

  // Method to get count of likes done on a specific date
  async getLikesDoneOnDate(date: Date): Promise<number> {
    try {
      // Placeholder method, not implemented yet
      return 0;
    } catch (error) {
      // Log error if any occurs while fetching likes
      this.logger.error(`Error getting likes done on ${date}`, error.stack);
      throw error;
    }
  }

  // Method to get total count of blogs written
  async getTotalBlogsWritten(): Promise<number> {
    try {
      return this.blogRepository.count();
    } catch (error) {
      // Log error if any occurs while fetching total blogs
      this.logger.error(`Error getting total blogs written`, error.stack);
      throw error;
    }
  }
}
