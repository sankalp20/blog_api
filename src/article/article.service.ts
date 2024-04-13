import { Injectable, UnauthorizedException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';

import { ArticleEntity } from 'src/entities/article.entity';
import { UserEntity } from 'src/entities/user.entity';
import { TagEntity } from 'src/entities/tag.entity';
import {
  CreateArticleDTO,
  UpdateArticleDTO,
  FindAllQuery,
  FindFeedQuery,
  ArticleResponse,
  LikedArticleResponse,
} from 'src/models/article.model';

@Injectable()
export class ArticleService {
  private readonly logger = new Logger(ArticleService.name);

  articleRepository: any;
  constructor(
    @InjectRepository(ArticleEntity)
    private articleRepo: Repository<ArticleEntity>,
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    @InjectRepository(TagEntity) private tagRepo: Repository<TagEntity>,
  ) {}

  async likeArticle(
    slug: string,
    user: UserEntity,
  ): Promise<LikedArticleResponse> {
    try {
      const article = await this.articleRepo.findOne({ where: { slug } });
      if (!article) {
        throw new NotFoundException('Article not found');
      }

      const alreadyLiked = article.favoritedBy.some(
        ({ id }) => id === user.id,
      );

      if (alreadyLiked) {
        // Unlike the article
        article.favoritedBy = article.favoritedBy.filter(
          ({ id }) => id !== user.id,
        );
      } else {
        // Like the article
        article.favoritedBy.push(user);
      }

      await article.save();
      this.logger.log(`Article ${slug} liked by user ${user.username}`);
      return this.buildLikedArticleResponse(article, user); // Return the article response
    } catch (error) {
      this.logger.error(`Error liking article ${slug} by user ${user.username}`, error.stack);
      throw error;
    }
  }

  private buildLikedArticleResponse(
    article: ArticleEntity,
    user: UserEntity,
  ): LikedArticleResponse {
    const { favoritedBy, ...rest } = article.toJSON();
    const favorited = favoritedBy.some(({ id }) => id === user.id);
    return { ...rest, slug: article.slug, title: article.title, description: article.description, body: article.body, favorited, tagList: [], createdAt: new Date(), updatedAt: new Date(), favoritesCount: 0, author: null };
  }

  private async upsertTags(tagList: string[]): Promise<void> {
    const foundTags = await this.tagRepo.find({
      where: tagList.map(t => ({ tag: t })),
    });
    const newTags = tagList.filter(t => !foundTags.map(t => t.tag).includes(t));
    await Promise.all(
      this.tagRepo.create(newTags.map(t => ({ tag: t }))).map(t => t.save()),
    );
  }

  async unlikeArticle(user: UserEntity, slug: string): Promise<ArticleEntity> {
    try {
      const article = await this.articleRepository.findOne({ where: { slug } });
      if (!article) {
        throw new NotFoundException('Article not found');
      }

      const index = article.favoritedBy.findIndex(u => u.id === user.id);
      if (index !== -1) {
        article.favoritedBy.splice(index, 1);
        article.favoritesCount--;
        await article.save();
      }

      this.logger.log(`Article ${slug} unliked by user ${user.username}`);
      return article;
    } catch (error) {
      this.logger.error(`Error unliking article ${slug} by user ${user.username}`, error.stack);
      throw error;
    }
  }

  async findAll(
    user: UserEntity,
    query: FindAllQuery,
  ): Promise<ArticleResponse[]> {
    try {
      let findOptions: any = {
        where: {},
      };
      if (query.author) {
        findOptions.where['author.username'] = query.author;
      }
      if (query.favorited) {
        findOptions.where['favoritedBy.username'] = query.favorited;
      }
      if (query.tag) {
        findOptions.where.tagList = Like(`%${query.tag}%`);
      }
      if (query.offset) {
        findOptions.offset = query.offset;
      }
      if (query.limit) {
        findOptions.limit = query.limit;
      }
      const articles = await this.articleRepo.find(findOptions);
      this.logger.log(`Found ${articles.length} articles`);
      return articles.map(article => article.toArticle(user));
    } catch (error) {
      this.logger.error(`Error finding articles`, error.stack);
      throw error;
    }
  }

  async findFeed(
    user: UserEntity,
    query: FindFeedQuery,
    ): Promise<ArticleResponse[]> {
      try {
        const { followee } = await this.userRepo.findOne({
          where: { id: user.id },
          relations: ['followee'],
        });
        const findOptions: FindManyOptions<ArticleEntity> = {
          ...query,
          where: followee.map(follow => ({ author: follow })),
      };
      const articles = await this.articleRepo.find(findOptions);
      this.logger.log(`Found ${articles.length} articles in feed`);
      return articles.map(article => article.toArticle(user));
      } catch (error) {
        this.logger.error(`Error finding feed articles`, error.stack);
        throw error;
      }
    }

  async findBySlug(slug: string): Promise<ArticleEntity> {
    try {
      const article = await this.articleRepo.findOne({
        where: { slug },
      });
      if (!article) {
        throw new NotFoundException('Article not found');
      }
      return article;
    } catch (error) {
      this.logger.error(`Error finding article ${slug}`, error.stack);
      throw error;
    }
  }

  private ensureOwnership(user: UserEntity, article: ArticleEntity): boolean {
    return article.author.id === user.id;
  }

  async createArticle(
    user: UserEntity,
    data: CreateArticleDTO,
  ): Promise<ArticleResponse> {
    try {
      const article = this.articleRepo.create({
        ...data,
        tagList: data.tagList.map(tag => ({ tag })),
      });
      article.author = user;
      await this.upsertTags(data.tagList);
      const { slug } = await article.save();
      this.logger.log(`Article ${slug} created by user ${user.username}`);
      return (await this.articleRepo.findOne({ where: { slug } })).toArticle(user);
    } catch (error) {
      this.logger.error(`Error creating article by user ${user.username}`, error.stack);
      throw error;
    }
  }

  async updateArticle(
    slug: string,
    user: UserEntity,
    data: UpdateArticleDTO,
  ): Promise<ArticleResponse> {
    try {
      const article = await this.findBySlug(slug);
      if (!this.ensureOwnership(user, article)) {
        throw new UnauthorizedException();
      }
      const tagList = data.tagList.map(tag => ({ tag }));
      await this.articleRepo.update({ slug }, { ...data, tagList });
      this.logger.log(`Article ${slug} updated by user ${user.username}`);
      return article.toArticle(user);
    } catch (error) {
      this.logger.error(`Error updating article ${slug} by user ${user.username}`, error.stack);
      throw error;
    }
  }

  async deleteArticle(
    slug: string,
    user: UserEntity,
  ): Promise<ArticleResponse> {
    try {
      const article = await this.findBySlug(slug);
      if (!this.ensureOwnership(user, article)) {
        throw new UnauthorizedException();
      }
      await this.articleRepo.remove(article);
      this.logger.log(`Article ${slug} deleted by user ${user.username}`);
      return article.toArticle(user);
    } catch (error) {
      this.logger.error(`Error deleting article ${slug} by user ${user.username}`, error.stack);
      throw error;
    }
  }

  async favoriteArticle(
    slug: string,
    user: UserEntity,
  ): Promise<ArticleResponse> {
    try {
      const article = await this.findBySlug(slug);
      article.favoritedBy.push(user);
      await article.save();
      this.logger.log(`Article ${slug} favorited by user ${user.username}`);
      return (await this.findBySlug(slug)).toArticle(user);
    } catch (error) {
      this.logger.error(`Error favoriting article ${slug} by user ${user.username}`, error.stack);
      throw error;
    }
  }

  async unfavoriteArticle(
    slug: string,
    user: UserEntity,
  ): Promise<ArticleResponse> {
    try {
      const article = await this.findBySlug(slug);
      article.favoritedBy = article.favoritedBy.filter(fav => fav.id !== user.id);
      await article.save();
      this.logger.log(`Article ${slug} unfavorited by user ${user.username}`);
      return (await this.findBySlug(slug)).toArticle(user);
    } catch (error) {
      this.logger.error(`Error unfavoriting article ${slug} by user ${user.username}`, error.stack);
      throw error;
    }
  }
}
