import {
  Entity,
  Column,
  BeforeInsert,
  ManyToOne,
  ManyToMany,
  RelationCount,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { classToPlain } from 'class-transformer';
import * as slugify from 'slug';

import { AbstractEntity } from './abstract-entity';
import { UserEntity } from './user.entity';
import { CommentEntity } from './comment.entity';
import { TagEntity } from './tag.entity';
import { ArticleResponse } from 'src/models/article.model';

@Entity('articles')
export class ArticleEntity extends AbstractEntity {
  @Column()
  slug: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  body: string;

  @ManyToMany(                 // ManyToMany relationship with UserEntity to track which users have liked the article.  
    type => UserEntity
    // ,user => user.favorites,{ eager: true },
  )
  @JoinTable()
  favoritedBy: UserEntity[];

  async updateContent(title: string, description: string, body: string): Promise<void> {    //Method to update the blog content
    this.title = title;
    this.description = description;
    this.body = body;
    await this.save();
  }

  @RelationCount((article: ArticleEntity) => article.favoritedBy)
  favoritesCount: number;

  @OneToMany(type => CommentEntity, comment => comment.article)
  comments: CommentEntity[];

  @ManyToOne(type => UserEntity, user => user.articles, { eager: true })
  author: UserEntity;

  @Column('simple-array')
  @ManyToMany(type => TagEntity)
  @JoinTable()
  tagList: TagEntity[];

  @BeforeInsert()
  generateSlug() {
    this.slug =
      slugify(this.title, { lower: true }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
  }

  toJSON() {
    return classToPlain(this);
  }

  toArticle(user?: UserEntity): ArticleResponse {
    let favorited = null;
    if (user) {
      favorited = this.favoritedBy.map(user => user.id).includes(user.id);
    }
    const article: any = this.toJSON();
    delete article.favoritedBy;
    return { ...article,
      createdAt: this.created, 
    updatedAt: this.updated,  
      favorited };
  }
}