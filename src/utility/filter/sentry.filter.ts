import { ArgumentsHost, Catch, Provider } from "@nestjs/common";
import { APP_FILTER, BaseExceptionFilter } from "@nestjs/core";
import * as Sentry from "@sentry/node";

@Catch()
class SentryExceptionFilter extends BaseExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const user = request.user;

    Sentry.withScope((scope) => {
      scope.setExtra("request", {
        url: request.url,
        method: request.method,
        headers: request.headers,
        body: request.body,
        params: request.params,
      });

      if (user) {
        scope.setUser({
          id: user.userId,
          role: user.userRole,
        });
      }

      Sentry.captureException(exception);
    });

    super.catch(exception, host);
  }
}

export const SentryExceptionFilterProvider: Provider = {
  provide: APP_FILTER,
  useClass: SentryExceptionFilter,
};
