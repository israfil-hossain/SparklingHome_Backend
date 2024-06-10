import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { AppModule } from "./app.module";
import { configureSwaggerUI } from "./config/swagger.config";
import { SentryLogger } from "./utility/logger/sentry.logger";

const logger = new Logger("Glansandehem");

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const cfg = app.get(ConfigService);

  Sentry.init({
    dsn: cfg.get<string>("SENTRY_DNS", ""),
    environment: cfg.get<string>("NODE_ENV", "development"),
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    normalizeDepth: 5,
    integrations: [nodeProfilingIntegration()],
  });

  app.useLogger(new SentryLogger());

  app.setGlobalPrefix("api");

  app.enableCors({
    origin: true,
  });
  configureSwaggerUI(app);

  const port = parseInt(cfg.get("PORT", "4000"), 10);
  await app.listen(port);

  return `${await app.getUrl()}`;
}

bootstrap()
  .then((serverUrl) => logger.log(`Server is running at: ${serverUrl}`))
  .catch((err) => logger.error("Something went wrong!", err));
