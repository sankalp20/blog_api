import { Controller, Post, Body, ValidationPipe, HttpException } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiUnauthorizedResponse, ApiBody } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { RegisterDTO, LoginDTO, AuthResponse, RegisterBody, LoginBody } from '../models/user.model';
import { ResponseObject } from 'src/models/response.model';

@Controller('users')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  @ApiCreatedResponse()
  @ApiBody({ type: RegisterBody })
  async register(
    @Body(ValidationPipe) credentials: RegisterDTO,
  ): Promise<ResponseObject<'user', AuthResponse>> {
    try {
      const user = await this.authService.register(credentials);
      return { user };
    } catch (err) {
      throw new HttpException(err.response, err.status);
    }
  }

  @Post('/login')
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiBody({ type: LoginBody })
  async login(
    @Body('user', ValidationPipe) credentials: LoginDTO,
  ): Promise<ResponseObject<'user', AuthResponse>> {
    try {
      const user = await this.authService.login(credentials);
      return { user };
    } catch (err) {
      throw new HttpException(err.response, err.status);
    }
  }
}
