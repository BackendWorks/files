import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PUBLIC_ROUTE_KEY } from '../../app/app.constant';

@Injectable()
export class AuthGuard {
  constructor(
    private reflector: Reflector,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext) {
    const isRpc = context.getType() === 'rpc';
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      PUBLIC_ROUTE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isPublic || isRpc) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    let token = request.headers['authorization'];
    if (!token) {
      throw new UnauthorizedException('accessTokenUnauthorized');
    }
    token = token.replace('Bearer ', '');
    const response = await firstValueFrom(
      this.authClient.send('validateToken', token),
    );
    if (!response) {
      throw new HttpException(response, HttpStatus.BAD_REQUEST);
    }
    request.user = response.data;
    return true;
  }
}
