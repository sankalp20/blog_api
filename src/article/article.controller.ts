import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Body,
  ValidationPipe,
  Put,
  Delete,
  Query,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOkResponse, ApiUnauthorizedResponse, ApiParam, ApiCreatedResponse, ApiBody, ApiOperation } from '@nestjs/swagger';
import { User } from 'src/auth/user.decorator';
import { OptionalAuthGuard } from 'src/auth/optional-auth.gaurd';
import {
  CreateCommentDTO,
  CommentResponse,
  CreateCommentBody,
} from 'src/models/comment.model';
import { UserEntity } from 'src/entities/user.entity';
import {
  CreateArticleDTO,
  UpdateArticleDTO,
  FindAllQuery,
  FindFeedQuery,
  ArticleResponse,
  CreateArticleBody,
  UpdateArticleBody,
  LikedArticleResponse,
} from 'src/models/article.model';
import { CommentsService } from './comments.service';
import { ArticleService } from './article.service';
import { ResponseObject } from 'src/models/response.model';

@ApiTags('Articles')
@Controller('articles')
export class ArticleController {
  private readonly logger = new Logger(ArticleController.name);
  constructor(
    private readonly articleService: ArticleService,
    private commentService: CommentsService,
  ) { }

  @ApiOkResponse({ description: 'List all articles' })
  @Get()
  @UseGuards(new OptionalAuthGuard())
  async findAll(
    @User() user: UserEntity,
    @Query() query: FindAllQuery,
  ): Promise<
    ResponseObject<'articles', ArticleResponse[]> &
    ResponseObject<'articlesCount', number>
  > {
    this.logger.log('Fetching all articles');
    const articles = await this.articleService.findAll(user, query);
    return {
      articles,
      articlesCount: articles.length,
    };
  }

  @ApiBearerAuth()
  @ApiOkResponse({ description: 'List all articles of users feed' })
  @ApiUnauthorizedResponse()
  @Get('/feed')
  @UseGuards(AuthGuard())
  async findFeed(
    @User() user: UserEntity,
    @Query() query: FindFeedQuery,
  ): Promise<
    ResponseObject<'articles', ArticleResponse[]> &
    ResponseObject<'articlesCount', number>
  > {
    const articles = await this.articleService.findFeed(user, query);
    return { articles, articlesCount: articles.length };
  }

  @ApiOkResponse({ description: 'Article with slug :slug' })
  @Get('/:slug')
  @UseGuards(new OptionalAuthGuard())
  async findBySlug(
    @Param('slug') slug: string,
    @User() user: UserEntity,
  ): Promise<ResponseObject<'article', ArticleResponse>> {
    this.logger.log(`Fetching article with slug: ${slug}`);
    const article = await this.articleService.findBySlug(slug);
    const articleResponse: ArticleResponse = {
      createdAt: article.created,
      updatedAt: article.updated,
      favorited: article.favoritedBy.length > 0,
      slug: '',
      title: '',
      description: '',
      body: '',
      tagList: [],
      favoritesCount: 0,
      author: undefined
    };
    return { article: articleResponse };
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Create article' })
  @ApiUnauthorizedResponse()
  @ApiBody({ type: CreateArticleBody })
  @Post()
  @UseGuards(AuthGuard())
  async createArticle(
    @User() user: UserEntity,
    @Body('article', ValidationPipe) data: CreateArticleDTO,
  ): Promise<ResponseObject<'article', ArticleResponse>> {
    this.logger.log(`Creating article with title: ${data.title}`);
    const article = await this.articleService.createArticle(user, data);
    return { article };
  }

  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Article updated successfully' }) 
  @ApiUnauthorizedResponse()
  @ApiBody({ type: UpdateArticleBody })
  @Put(':slug')
  @UseGuards(AuthGuard())
  async updateArticle(
    @Param('slug') slug: string,
    @User() user: UserEntity,
    @Body() newContent: { title: string; description: string; body: string; tagList: string[] },
  ): Promise<ArticleResponse> {
    this.logger.log(`Updating article with slug: ${slug}`);
    return this.articleService.updateArticle(slug, user, newContent);
  }

  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Delete article' })
  @ApiUnauthorizedResponse()
  @Delete('/:slug')
  @UseGuards(AuthGuard())
  async deleteArticle(
    @Param() slug: string,
    @User() user: UserEntity,
  ): Promise<ResponseObject<'article', ArticleResponse>> {
    this.logger.log(`Deleting article with slug: ${slug}`);
    const article = await this.articleService.deleteArticle(slug, user);
    return { article };
  }

  @ApiOkResponse({ description: 'List article comments' })
  @Get('/:slug/comments')
  async findComments(
    @Param('slug') slug: string,
  ): Promise<ResponseObject<'comments', CommentResponse[]>> {
    const comments = await this.commentService.findByArticleSlug(slug);
    return { comments };
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Create new comment' })
  @ApiUnauthorizedResponse()
  @ApiBody({ type: CreateCommentBody })
  @Post('/:slug/comments')
  async createComment(
    @User() user: UserEntity,
    @Body('comment', ValidationPipe) data: CreateCommentDTO,
  ): Promise<ResponseObject<'comment', CommentResponse>> {
    const comment = await this.commentService.createComment(user, data);
    return { comment };
  }

  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Delete comment' })
  @ApiUnauthorizedResponse()
  @Delete('/:slug/comments/:id')
  async deleteComment(
    @User() user: UserEntity,
    @Param('id') id: number,
  ): Promise<ResponseObject<'comment', CommentResponse>> {
    const comment = await this.commentService.deleteComment(user, id);
    return { comment };
  }

  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Favorite article' })
  @ApiUnauthorizedResponse()
  @Post('/:slug/favorite')
  @UseGuards(AuthGuard())
  async favoriteArticle(
    @Param('slug') slug: string,
    @User() user: UserEntity,
  ): Promise<ResponseObject<'article', ArticleResponse>> {
    const article = await this.articleService.favoriteArticle(slug, user);
    return { article };
  }

  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Unfavorite article' })
  @ApiUnauthorizedResponse()
  @Delete('/:slug/favorite')
  @UseGuards(AuthGuard())
  async unfavoriteArticle(
    @Param('slug') slug: string,
    @User() user: UserEntity,
  ): Promise<ResponseObject<'article', ArticleResponse>> {
    const article = await this.articleService.unfavoriteArticle(slug, user);
    return { article };
  }

  // Adding end-points to like and unlike the article.

  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Like an article' })
  @ApiUnauthorizedResponse()
  @Post(':slug/like')
  async likeArticle(
    @User() user: UserEntity,
    @Param('slug') slug: string,
  ): Promise<ResponseObject<'article', ArticleResponse>> {
    const article = await this.articleService.likeArticle(slug, user);
    return { article };
  }

  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Unlike an article' })
  @ApiUnauthorizedResponse()
  @Delete(':slug/like')
  async unlikeArticle(
    @User() user: UserEntity,
    @Param('slug') slug: string,
  ): Promise<ResponseObject<'article', ArticleResponse>> {
    const article = await this.articleService.unlikeArticle(user, slug);
    const response: ResponseObject<'article', ArticleResponse> = {
      article: {
        ...article,
        createdAt: article.created,
        updatedAt: article.updated,
        favorited: article.favoritedBy.length > 0,
        tagList: article.tagList.map(tag => tag.name),
        author: {
          ...article.author,
          following: null,
        },
      },
    };
    return response;
  }

}