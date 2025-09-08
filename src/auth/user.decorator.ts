import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface User {
  userId: string;
  username: string;
  email?: string;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
