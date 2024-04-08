import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import toStream from "buffer-to-stream";
import {
  v2 as CloudinaryAPI,
  DeleteApiResponse,
  UploadApiErrorResponse,
  UploadApiResponse,
} from "cloudinary";
import { ImageMetaDocument } from "./entities/image-meta.entity";
import { ImageMetaRepository } from "./image-meta.repository";

@Injectable()
export class ImageMetaService {
  private readonly logger: Logger = new Logger(ImageMetaService.name);

  constructor(private readonly imageMetaRepository: ImageMetaRepository) {}

  async createSingleImage(
    singleImageFile: Express.Multer.File,
    ownerId: string,
  ): Promise<ImageMetaDocument> {
    try {
      if (!singleImageFile) {
        throw new BadRequestException("No image file provided");
      }

      const extension = this.getFileExtension(singleImageFile.originalname);
      const uploadResult = await this.uploadImageToCloudinary(singleImageFile);

      const singleImage = await this.imageMetaRepository.create({
        url: uploadResult.secure_url,
        name: uploadResult.public_id,
        extension: extension,
        size: singleImageFile.size,
        mimeType: singleImageFile.mimetype,
        ownerId: ownerId,
      });

      return singleImage;
    } catch (error) {
      this.logger.error(`Error creating single image:`, error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new InternalServerErrorException("Failed to create single image");
      }
    }
  }

  async createMultipleImages(
    multipleImageFiles: Express.Multer.File[],
    ownerId: string,
  ): Promise<ImageMetaDocument[]> {
    try {
      if (!multipleImageFiles || multipleImageFiles.length === 0) {
        throw new BadRequestException("No image files provided");
      }

      const multipleImages = await Promise.all(
        multipleImageFiles.map(
          async (image) => await this.createSingleImage(image, ownerId),
        ),
      );

      return multipleImages;
    } catch (error) {
      this.logger.error(`Error creating multiple images:`, error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          "Failed to create multiple images",
        );
      }
    }
  }

  async removeImage(
    imageId: string,
    ownerId: string,
  ): Promise<ImageMetaDocument | null> {
    try {
      const deletedImage = await this.imageMetaRepository.getOneWhere({
        _id: imageId,
        ownerId: ownerId,
      });

      if (!deletedImage) {
        throw new Error(`Could not find image with id: ${imageId}`);
      }

      await this.deleteImageFromCloudinary(deletedImage.name);
      await this.imageMetaRepository.removeOneById(imageId);

      return deletedImage;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(`Error deleting image:`, error);
      throw new InternalServerErrorException("Could not delete image");
    }
  }

  //#region Helper for cloud upload
  async uploadImageToCloudinary(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse> {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = CloudinaryAPI.uploader.upload_stream(
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) {
            this.logger.error(`Failed to upload image to Cloudinary`, error);
            reject(error);
          } else if (!result) {
            const errorMessage = "Upload result is undefined";
            this.logger.error(
              `Failed to upload image to Cloudinary: ${errorMessage}`,
            );
            reject(new Error(errorMessage));
          } else {
            resolve(result);
          }
        },
      );

      const stream = toStream(file.buffer);
      stream.pipe(uploadStream);
    });
  }

  async deleteImageFromCloudinary(
    publicId: string,
  ): Promise<DeleteApiResponse> {
    try {
      return await CloudinaryAPI.uploader.destroy(publicId);
    } catch (error) {
      this.logger.error(
        `Failed to delete image from Cloudinary with public ID: ${publicId}`,
        error,
      );
      throw error;
    }
  }

  private getFileExtension(originalName: string): string {
    const lastDotIndex = originalName?.lastIndexOf(".");

    if (lastDotIndex === -1) {
      return "";
    }

    return originalName?.slice(lastDotIndex + 1);
  }
  //#endregion
}
