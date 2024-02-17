import { ConfigService } from "@nestjs/config";
import { v2 as CloudinaryAPI } from "cloudinary";

export const CLOUDINARY = "CLOUDINARY";

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: (configService: ConfigService) => {
    return CloudinaryAPI.config({
      cloud_name: configService.get<string>("CLD_CLOUD_NAME"),
      api_key: configService.get<string>("CLD_API_KEY"),
      api_secret: configService.get<string>("CLD_API_SECRET"),
    });
  },
  inject: [ConfigService], // Inject the ConfigService
};
