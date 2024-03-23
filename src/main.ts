import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { configureSentryService } from "./config/sentry.config";
import { configureSwaggerUI } from "./config/swagger.config";
import { SentryLogger } from "./utility/logger/sentry.logger";

const logger = new Logger("Glansandehem");

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new SentryLogger(),
  });

  app.setGlobalPrefix("api");

  app.enableCors({
    origin: true,
  });

  const cfg = app.get(ConfigService);
  configureSwaggerUI(app);
  configureSentryService(cfg);

  const port = parseInt(cfg.get("PORT", "4000"), 10);
  await app.listen(port);

  return `${await app.getUrl()}`;
}

bootstrap()
  .then((serverUrl) => logger.log(`Server is running at: ${serverUrl}`))
  .catch((err) => logger.error("Something went wrong!", err));
