import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../users.entity';

export const CurrentUser = createParamDecorator(
  (data: never, context: ExecutionContext) => {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: User | null }>();
    return request.user;
  },
);
