import { Controller, Get, Param, Delete, NotFoundException, Logger } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  private readonly logger = new Logger(AdminController.name); 

  constructor(private readonly adminService: AdminService) {}

  @Delete('archive/blog/:id')
  async archiveBlog(@Param('id') id: number) {
    try {
      await this.adminService.archiveBlog(id);
      return { message: 'Blog archived successfully' };
    } catch (error) {
      this.logger.error(`Error archiving blog with ID ${id}`, error.stack); 
      throw new NotFoundException('Blog not found');
    }
  }

  @Delete('archive/comment/:id')
  async archiveComment(@Param('id') id: number) {
    try {
      await this.adminService.archiveComment(id);
      return { message: 'Comment archived successfully' };
    } catch (error) {
      this.logger.error(`Error archiving comment with ID ${id}`, error.stack); 
      throw new NotFoundException('Comment not found');
    }
  }

  @Delete('archive/user/:id')
  async archiveUser(@Param('id') id: number) {
    try {
      await this.adminService.archiveUser(id);
      return { message: 'User archived successfully' };
    } catch (error) {
      this.logger.error(`Error archiving user with ID ${id}`, error.stack); // Log error
      throw new NotFoundException('User not found');
    }
  }

  @Get('stats/blogs/:date')
  async getBlogsWrittenOnDate(@Param('date') date: string) {
    try {
      const count = await this.adminService.getBlogsWrittenOnDate(new Date(date));
      return { count };
    } catch (error) {
      this.logger.error(`Error getting blogs written on ${date}`, error.stack); 
      throw error;
    }
  }

  @Get('stats/comments/:date')
  async getCommentsMadeOnDate(@Param('date') date: string) {
    try {
      const count = await this.adminService.getCommentsMadeOnDate(new Date(date));
      return { count };
    } catch (error) {
      this.logger.error(`Error getting comments made on ${date}`, error.stack); 
      throw error;
    }
  }

  @Get('stats/likes/:date')
  async getLikesDoneOnDate(@Param('date') date: string) {
    try {
      const count = await this.adminService.getLikesDoneOnDate(new Date(date));
      return { count };
    } catch (error) {
      this.logger.error(`Error getting likes done on ${date}`, error.stack); 
      throw error;
    }
  }

  @Get('stats/total-blogs')
  async getTotalBlogsWritten() {
    try {
      const count = await this.adminService.getTotalBlogsWritten();
      return { count };
    } catch (error) {
      this.logger.error(`Error getting total blogs written`, error.stack); 
      throw error;
    }
  }
}
