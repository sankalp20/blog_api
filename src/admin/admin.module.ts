import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ArticleEntity } from '../entities/article.entity';
import { CommentEntity } from '../entities/comment.entity';
import { UserEntity } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ArticleEntity, CommentEntity, UserEntity])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
