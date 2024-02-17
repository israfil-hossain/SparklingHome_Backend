import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { GenericRepository } from "../common/repository/generic-repository";
import {
  ImageMeta,
  ImageMetaDocument,
  ImageMetaType,
} from "./entities/image-meta.entity";

@Injectable()
export class ImageMetaRepository extends GenericRepository<ImageMetaDocument> {
  constructor(
    @InjectModel(ImageMeta.name)
    private model: ImageMetaType,
  ) {
    super(model, new Logger(ImageMetaRepository.name));
  }
}
