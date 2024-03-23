import { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as Sentry from "@sentry/node";

export const configureSentryService = (
  app: INestApplication<any>,
  cfg: ConfigService,
) => {
  Sentry.init({
    dsn: cfg.get<string>("SENTRY_DNS", ""),
    environment: cfg.get<string>("NODE_ENV", "development"),
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Http({ tracing: true })],
  });

  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
  app.use(Sentry.Handlers.errorHandler());
};
