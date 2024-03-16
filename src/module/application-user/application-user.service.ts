import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { PaginatedResponseDto } from "../common/dto/paginated-response.dto";
import { SuccessResponseDto } from "../common/dto/success-response.dto";
import { EncryptionService } from "../encryption/encryption.service";
import { ImageMetaService } from "../image-meta/image-meta.service";
import { ApplicationUserRepository } from "./application-user.repository";
import { CreateApplicationUserDto } from "./dto/create-application-user.dto";
import { ListApplicationUserQuery } from "./dto/list-application-user-query.dto";
import { UpdateApplicationUserProfilePictureDto } from "./dto/update-application-user-profile-picture.dto";
import { UpdateApplicationUserDto } from "./dto/update-application-user.dto";

@Injectable()
export class ApplicationUserService {
  private readonly logger: Logger = new Logger(ApplicationUserService.name);

  constructor(
    private readonly applicationUserRepository: ApplicationUserRepository,
    private readonly encryptionService: EncryptionService,
    private readonly imageService: ImageMetaService,
  ) {}

  async create(
    userCreateDto: CreateApplicationUserDto,
  ): Promise<SuccessResponseDto> {
    try {
      userCreateDto["password"] = await this.encryptionService.hashPassword(
        userCreateDto.password,
      );

      const newUser =
        await this.applicationUserRepository.create(userCreateDto);

      return new SuccessResponseDto("User created successfully", newUser);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error("Error creating new document:", error.description);
      throw new BadRequestException("Error creating new document");
    }
  }

  async findAll({
    Page = 1,
    PageSize = 10,
    Name = "",
    Email = "",
  }: ListApplicationUserQuery): Promise<PaginatedResponseDto> {
    try {
      // Search query setup
      const searchQuery: Record<string, any> = {};
      if (Email) {
        searchQuery["email"] = { $regex: Email, $options: "i" };
      }
      if (Name) {
        searchQuery["fullName"] = { $regex: Name, $options: "i" };
      }

      // Pagination setup
      const totalRecords =
        await this.applicationUserRepository.count(searchQuery);
      const skip = (Page - 1) * PageSize;

      const result = await this.applicationUserRepository.getAll(searchQuery, {
        limit: PageSize,
        skip,
      });

      return new PaginatedResponseDto(totalRecords, Page, PageSize, result);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error("Error finding users:", error);
      throw new BadRequestException("Could not get all users");
    }
  }

  async findOne(id: string): Promise<SuccessResponseDto> {
    try {
      const user = await this.applicationUserRepository.getOneById(id);

      if (!user) {
        this.logger.error(`User Document not found with ID: ${id}`);
        throw new NotFoundException(`Could not find user with ID: ${id}`);
      }

      return new SuccessResponseDto("User found successfully", user);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(`Error finding user with id ${id}:`, error);
      throw new BadRequestException("Could not get users with id: " + id);
    }
  }

  async update(id: string, updateUserDto: UpdateApplicationUserDto) {
    try {
      const result = await this.applicationUserRepository.updateOneById(
        id,
        updateUserDto,
      );

      return new SuccessResponseDto("User updated successfully", result);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error("Error updating new document:", error.description);
      throw new BadRequestException("Error updating new document");
    }
  }

  async remove(id: string): Promise<SuccessResponseDto> {
    try {
      const result = await this.applicationUserRepository.removeOneById(id);
      if (!result) {
        this.logger.error(`User Document not delete with ID: ${id}`);
        throw new BadRequestException(`Could not delete user with ID: ${id}`);
      }

      return new SuccessResponseDto("User deleted successfully");
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(`Error deleting user with id ${id}:`, error);
      throw new BadRequestException("Could not delete users with id: " + id);
    }
  }

  async updateOwnUserProfilePicture(
    { profilePicture }: UpdateApplicationUserProfilePictureDto,
    userId: string,
  ): Promise<SuccessResponseDto> {
    try {
      const user = await this.applicationUserRepository.getOneById(userId);

      if (!user) {
        this.logger.error(`User Document not found with ID: ${userId}`);
        throw new NotFoundException(`Could not find user with ID: ${userId}`);
      }

      if (user?.profilePicture) {
        await this.imageService.removeImage(
          user?.profilePicture as unknown as string,
          userId,
        );
      }

      const createdImage = await this.imageService.createSingleImage(
        profilePicture,
        userId,
      );

      await this.applicationUserRepository.updateOneById(user?.id, {
        profilePicture: createdImage.id,
      });

      return new SuccessResponseDto("Profile picture updated successfully");
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error("Error updating new document:", error.description);
      throw new BadRequestException("Error updating new document");
    }
  }
}
