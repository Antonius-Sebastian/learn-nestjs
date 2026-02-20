import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { UsersService } from '../users.service';
import { Observable } from 'rxjs';
import { User } from '../users.entity';

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  constructor(private usersService: UsersService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { session: { sub: number }; user: User | null }>();
    const { sub: userId } = request.session;
    const user = await this.usersService.findOne(userId);
    request.user = user;

    return next.handle();
  }
}
