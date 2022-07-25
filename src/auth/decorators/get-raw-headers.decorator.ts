import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Gets request rawHeaders
 */
export const RawHeaders = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();

    return req.rawHeaders;
  },
);
