import { ConfigService } from "@nestjs/config";
import * as Sentry from "@sentry/node";

export const configureSentryService = (cfg: ConfigService) => {
  Sentry.init({
    debug: true,
    dsn: cfg.get<string>("SENTRY_DNS", ""),
    environment: cfg.get<string>("NODE_ENV", "development"),
  });
};
