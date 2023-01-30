import {
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../core/decorators';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class JwtAuthGuard {
  constructor(
    private reflector: Reflector,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext) {
    const type = context.getType();
    console.log(type);
    if (type === 'rpc') {
      return true;
    }
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    let token = request.headers['authorization'];
    token = token.replace('Bearer ', '');
    console.log(token);

    if (!token) {
      throw new UnauthorizedException();
    }
    const user = await firstValueFrom(
      this.authClient.send('get_user_from_token', JSON.stringify({ token })),
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    request.userId = user['userId'];
    return true;
  }
}
