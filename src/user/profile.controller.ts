import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Post,
  Delete,
  UseGuards,
  HttpCode,
  Logger
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/auth/user.decorator';
import { UserEntity } from 'src/entities/user.entity';
import { OptionalAuthGuard } from 'src/auth/optional-auth.gaurd';
import { UserService } from './user.service';
import { ResponseObject } from 'src/models/response.model';
import { ProfileResponse } from 'src/models/user.model';

@Controller('profiles')
export class ProfileController {
  private readonly logger = new Logger(ProfileController.name);
  constructor(private readonly userService: UserService) {}

  @ApiOkResponse({ description: 'Find user profile' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiParam({ name: 'username', description: 'User username', type: 'string' })
  @Get('/:username')
  @UseGuards(new OptionalAuthGuard())
  async findProfile(
    @Param('username') username: string,
    @User() user: UserEntity,
  ): Promise<ResponseObject<'profile', ProfileResponse>> {
    this.logger.log(`Finding profile for user: ${username}`);
    const profile = await this.userService.findByUsername(username, user);
    if (!profile) {
      throw new NotFoundException();
    }
    return { profile };
  }

  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Get authenticated user profile' })
  @Get('me')
  @UseGuards(AuthGuard())
  async getAuthenticatedUserProfile(
    @User() user: UserEntity,
  ): Promise<ResponseObject<'profile', ProfileResponse>> {
    this.logger.log(`Getting authenticated user profile`);
    const profile = await this.userService.getAuthenticatedUserProfile(user);
    if (profile === undefined || profile === null) {
      throw new NotFoundException('User profile not found');
    }
    return { profile } as unknown as ResponseObject<'profile', ProfileResponse>;
  }
  
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Follow user' })
  @ApiUnauthorizedResponse()
  @Post('/:username/follow')
  @HttpCode(200)
  @UseGuards(AuthGuard())
  async followUser(
    @User() user: UserEntity,
    @Param('username') username: string,
  ): Promise<ResponseObject<'profile', ProfileResponse>> {
    this.logger.log(`Following user: ${username}`);
    const profile = await this.userService.followUser(user, username);
    return { profile };
  }

  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Unfollow user' })
  @ApiUnauthorizedResponse()
  @Delete('/:username/follow')
  @UseGuards(AuthGuard())
  async unfollowUser(
    @User() user: UserEntity,
    @Param('username') username: string,
  ): Promise<ResponseObject<'profile', ProfileResponse>> {
    this.logger.log(`Unfollowing user: ${username}`);
    const profile = await this.userService.unfollowUser(user, username);
    return { profile };
  }
}
