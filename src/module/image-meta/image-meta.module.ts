import { Global, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CloudinaryProvider } from "../../utility/provider/cloudinary.provider";
import { ImageMeta, ImageMetaSchema } from "./entities/image-meta.entity";
import { ImageMetaRepository } from "./image-meta.repository";
import { ImageMetaService } from "./image-meta.service";

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ImageMeta.name, schema: ImageMetaSchema },
    ]),
  ],
  providers: [ImageMetaService, ImageMetaRepository, CloudinaryProvider],
  exports: [ImageMetaService],
})
export class ImageMetaModule {}
