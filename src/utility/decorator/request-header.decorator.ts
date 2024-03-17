import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export const OriginHeader = createParamDecorator(
  (data: string, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest();
    return request?.headers?.origin || null;
  },
);

export const HostHeader = createParamDecorator(
  (data: string, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest();
    return `${request.protocol}://${request.get("Host")}`;
  },
);
