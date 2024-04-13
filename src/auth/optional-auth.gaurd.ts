import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Logger } from '@nestjs/common';

@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(OptionalAuthGuard.name);

  handleRequest(err, user, info, context: ExecutionContext) {
    if (err || !user) {
      this.logger.error('Unauthorized request');
      return null;
    }
    return user;
  }
}
