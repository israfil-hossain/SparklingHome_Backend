import {
  createParamDecorator,
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { ObjectId } from "mongodb";

const logger = new Logger("AuthUserId");

export const AuthUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ITokenPayload => {
    const request = ctx.switchToHttp().getRequest();
    const tokenUser: ITokenPayload = request?.user;

    if (!tokenUser || !ObjectId.isValid(tokenUser?.userId)) {
      logger.error("Invalid user ID of logged-in user");
      throw new UnauthorizedException("Invalid user ID of logged-in user");
    }

    return tokenUser;
  },
);
