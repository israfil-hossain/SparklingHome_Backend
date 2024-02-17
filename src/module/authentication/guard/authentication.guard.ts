import type { Request as ExpressRequest } from "express";

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  SetMetadata,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";

const IS_PUBLIC_KEY = "IS_PUBLIC_KEY";
export const IsPublic = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private readonly logger = new Logger(AuthenticationGuard.name);

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    //#region Allow when IsPublic is used
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    //#endregion

    //#region Verify jwt token from request or throw
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    try {
      const tokenPayload: ITokenPayload = await this.jwtService.verifyAsync(
        token,
        {
          secret: this.configService.get<string>(
            "JWT_SECRET",
            "ACOMPLEXSECRETANDKEEPITSAFE",
          ),
        },
      );

      if (!tokenPayload.userId || !tokenPayload.userRole) {
        this.logger.error(`Invalid payload found in token: ${token}`);
        throw new UnauthorizedException(
          "User is not authorized to perform this action",
        );
      }

      request["user"] = tokenPayload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error(
        `User is not authorized to perform this action with token: ${token}`,
      );
      throw new UnauthorizedException(
        "User is not authorized to perform this action",
      );
    }

    return true;
    //#endregion
  }

  //#region Private helper methods
  private extractTokenFromHeader(request: ExpressRequest): string {
    const [type, token] = request?.headers?.authorization?.split(" ") ?? [];
    if (type !== "Bearer" || !token) {
      this.logger.error(
        `Invalid authorization header: ${request?.headers?.authorization}`,
      );
      throw new UnauthorizedException(
        "User is not authorized to perform this action",
      );
    }

    return token;
  }
  //#endregion
}
