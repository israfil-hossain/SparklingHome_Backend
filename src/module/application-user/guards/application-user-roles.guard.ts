import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  Provider,
  UnauthorizedException,
} from "@nestjs/common";
import { APP_GUARD, Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { RequiredRoles } from "../decorator/roles.decorator";
import { ApplicationUserRoleEnum } from "../enum/application-user-role.enum";

@Injectable()
export class ApplicationUserRolesGuard implements CanActivate {
  private readonly logger = new Logger(ApplicationUserRolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<ApplicationUserRoleEnum[]>(
      RequiredRoles,
      context.getHandler(),
    );

    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: ITokenPayload = request?.user;
    if (!user) {
      throw new UnauthorizedException(
        "User is not authorized to perform this action",
      );
    }

    if (
      !roles.some((role: ApplicationUserRoleEnum) => user.userRole === role)
    ) {
      this.logger.error(
        `User does not have required roles: ${roles.join(", ")}`,
        user,
      );
      throw new ForbiddenException(
        "User is not authorized to perform this action",
      );
    }

    return true;
  }
}

export const RolesGuardProvider: Provider = {
  provide: APP_GUARD,
  useClass: ApplicationUserRolesGuard,
};
