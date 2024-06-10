import { Catch, Provider, type ArgumentsHost } from "@nestjs/common";
import { APP_FILTER, BaseExceptionFilter } from "@nestjs/core";
import * as Sentry from "@sentry/node";

@Catch()
class SentryExceptionFilter extends BaseExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const request = http.getRequest();

    Sentry.withScope((scope) => {
      if (request) {
        scope.setTag("url", request?.url);
        scope.setExtra("request", {
          url: request.url,
          method: request.method,
          headers: request.headers,
          params: request.params,
          body: JSON.stringify(request.body ?? {}),
        });

        if (request?.user) {
          scope.setUser({
            id: request?.user?.userId,
            email: request?.user?.userEmail,
            username: request?.user?.userName,
            Role: request?.user?.userRole,
          });
        }

        scope.setTransactionName(Date.now().toString());
        scope.setTag("environment", process.env.NODE_ENV || "development");
        scope.setExtra("timestamp", new Date().toISOString());
      }

      if (exception.response) {
        scope.setExtra("response", exception.response);
        scope.setTag("status_code", exception.response?.statusCode);
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
