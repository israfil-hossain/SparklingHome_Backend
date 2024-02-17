import { APP_GUARD } from "@nestjs/core";
import { AuthenticationGuard } from "../guard/authentication.guard";

export const AuthenticationGuardProvider = {
  provide: APP_GUARD,
  useClass: AuthenticationGuard,
};
