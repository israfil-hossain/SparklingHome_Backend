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

    if (configService.get<string>("NODE_ENV") === "production") {
      const MONGO_PROD_URI = configService.getOrThrow<string>("MONGO_URI");

      return {
        uri: `${MONGO_PROD_URI}/${DATABASE_NAME}`,
      };
    }

    const MONGO_DEV_URI =
      configService.get<string>("MONGO_DEV_URI") || "mongodb://localhost:27017";

    return {
      uri: `${MONGO_DEV_URI}/${DATABASE_NAME}`,
    };
  },
};
