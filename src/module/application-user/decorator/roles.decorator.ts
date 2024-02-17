import { Reflector } from "@nestjs/core";
import { ApplicationUserRoleEnum } from "../enum/application-user-role.enum";

export const RequiredRoles =
  Reflector.createDecorator<ApplicationUserRoleEnum[]>();
