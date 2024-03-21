import { ConfigModule, ConfigService } from "@nestjs/config";
import {
  MongooseModuleAsyncOptions,
  MongooseModuleOptions,
} from "@nestjs/mongoose";

export const mongooseConfig: MongooseModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (
    configService: ConfigService,
  ): Promise<MongooseModuleOptions> => {
    const DATABASE_NAME = "sparkling-home";
    const mongoURI =
      configService.get<string>(
        configService.get<string>("NODE_ENV") === "production"
          ? "MONGO_URI"
          : "MONGO_DEV_URI",
      ) || "mongodb://localhost:27017";

    const url = new URL(mongoURI);
    url.pathname = url.pathname.endsWith("/")
      ? `${url.pathname}${DATABASE_NAME}`
      : `${url.pathname}/${DATABASE_NAME}`;

    return {
      uri: url.toString(),
    };
  },
};
