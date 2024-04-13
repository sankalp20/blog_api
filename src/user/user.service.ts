import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from 'src/entities/user.entity';
import { ProfileResponse } from 'src/models/user.model';

@Injectable()
export class UserService {
  delete(id: number) {
      throw new Error('Method not implemented.');
  }
  findById(id: number) {
      throw new Error('Method not implemented.');
  }
  findAll() {
      throw new Error('Method not implemented.');
  }
  private readonly logger = new Logger(UserService.name);
  
  findProfile(username: string) {
    throw new Error('Method not implemented.');
  }
  getAuthenticatedUserProfile(user: UserEntity) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
  ) {}

  async findByUsername(
    username: string,
    user?: UserEntity,
  ): Promise<ProfileResponse> {
    this.logger.log(`Finding user profile for username: ${username}`);
    return (
      await this.userRepo.findOne({
        where: { username },
        relations: ['followers'],
      })
    ).toProfile(user);
  }

  async followUser(
    currentUser: UserEntity,
    username: string,
  ): Promise<ProfileResponse> {
    this.logger.log(`Following user: ${username}`);
    const user = await this.userRepo.findOne({
      where: { username },
      relations: ['followers'],
    });
    user.followers.push(currentUser);
    await user.save();
    return user.toProfile(currentUser);
  }

  async unfollowUser(
    currentUser: UserEntity,
    username: string,
  ): Promise<ProfileResponse> {
    this.logger.log(`Unfollowing user: ${username}`);
    const user = await this.userRepo.findOne({
      where: { username },
      relations: ['followers'],
    });
    user.followers = user.followers.filter(
      follower => follower !== currentUser,
    );
    await user.save();
    return user.toProfile(currentUser);
  }
}