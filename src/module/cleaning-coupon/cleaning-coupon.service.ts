import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { PaginatedResponseDto } from "../common/dto/paginated-response.dto";
import { SuccessResponseDto } from "../common/dto/success-response.dto";
import { CleaningCouponRepository } from "./cleaning-coupon.repository";
import { CreateCleaningCouponDto } from "./dto/create-cleaning-coupon.dto";
import { ListCleaningCouponQueryDto } from "./dto/list-cleaning-coupon-query.dto";
import { UpdateCleaningCouponDto } from "./dto/update-cleaning-coupon.dto";

@Injectable()
export class CleaningCouponService {
  private readonly logger: Logger = new Logger(CleaningCouponService.name);

  constructor(
    private readonly cleaningCouponRepository: CleaningCouponRepository,
  ) {}

  async create(
    createCleaningCouponDto: CreateCleaningCouponDto,
    userId: string,
  ): Promise<SuccessResponseDto> {
    try {
      const newItem = await this.cleaningCouponRepository.create({
        ...createCleaningCouponDto,
        createdBy: userId,
      });

      return new SuccessResponseDto("Document created successfully", newItem);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error("Error creating new document:", error);
      throw new BadRequestException("Error creating new document");
    }
  }

  async findAll({
    Page = 1,
    PageSize: limit = 10,
    CouponCode = "",
  }: ListCleaningCouponQueryDto): Promise<PaginatedResponseDto> {
    try {
      // Search query setup
      const searchQuery: Record<string, any> = {};
      if (CouponCode) {
        searchQuery["couponCode"] = { $regex: CouponCode, $options: "i" };
      }

      const count = await this.cleaningCouponRepository.count(searchQuery);
      const skip = (Page - 1) * limit;

      const result = await this.cleaningCouponRepository.getAll(searchQuery, {
        limit,
        skip,
      });

      return new PaginatedResponseDto(count, Page, limit, result);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error("Error finding all document:", error);
      throw new BadRequestException("Could not get all document");
    }
  }

  async findOne(id: string): Promise<SuccessResponseDto> {
    try {
      const result = await this.cleaningCouponRepository.getOneById(id, {
        populate: [
          {
            path: "createdBy",
            select: "id email fullName",
          },
          {
            path: "updatedBy",
            select: "id email fullName",
          },
        ],
      });

      if (!result) {
        this.logger.error(`Document not found with ID: ${id}`);
        throw new NotFoundException(`Could not find document with ID: ${id}`);
      }

      return new SuccessResponseDto("Document found successfully", result);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error("Error finding document:", error);
      throw new BadRequestException("Could not get document");
    }
  }

  async update(
    id: string,
    updateCleaningCouponDto: UpdateCleaningCouponDto,
    userId: string,
  ): Promise<SuccessResponseDto> {
    try {
      const result = await this.cleaningCouponRepository.updateOneById(
        id,
        {
          ...updateCleaningCouponDto,
          updatedBy: userId,
          updatedAt: new Date(),
        },
        { new: true },
      );

      if (!result) {
        this.logger.error(`Document not found with ID: ${id}`);
        throw new NotFoundException(`Could not find document with ID: ${id}`);
      }

      return new SuccessResponseDto("Document updated successfully", result);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error("Error updating document:", error);
      throw new BadRequestException("Error updating document");
    }
  }

  async remove(id: string): Promise<SuccessResponseDto> {
    try {
      const result = await this.cleaningCouponRepository.removeOneById(id);

      if (!result) {
        this.logger.error(`Document not found with ID: ${id}`);
        throw new BadRequestException(
          `Could not delete document with ID: ${id}`,
        );
      }

      return new SuccessResponseDto("Document deleted successfully");
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error("Error deleting document:", error);
      throw new BadRequestException("Error deleting document");
    }
  }

  async verifyCouponCode(couponCode: string): Promise<SuccessResponseDto> {
    try {
      const result = await this.cleaningCouponRepository.getOneWhere({
        couponCode: couponCode,
        isActive: true,
      });

      if (!result) {
        throw new BadRequestException("Coupon code is not valid");
      }

      return new SuccessResponseDto("Coupon is valid to apply", result);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error("Error verifying coupon code:", error);
      throw new BadRequestException("Error verifying coupon code");
    }
  }
}
