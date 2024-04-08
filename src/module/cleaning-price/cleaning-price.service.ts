import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { CleaningSubscriptionFrequencyEnum } from "../cleaning-subscription/enum/cleaning-subscription-frequency.enum";
import { IdNameResponseDto } from "../common/dto/id-name-respones.dto";
import { SuccessResponseDto } from "../common/dto/success-response.dto";
import { CleaningPriceRepository } from "./cleaning-price.repository";
import { CreateCleaningPriceDto } from "./dto/create-cleaning-price.dto";
import { UpdateCleaningPriceDto } from "./dto/update-cleaning-price.dto";

@Injectable()
export class CleaningPriceService {
  private readonly logger: Logger = new Logger(CleaningPriceService.name);

  constructor(
    private readonly cleaningPriceRepository: CleaningPriceRepository,
  ) {}

  async create(
    createDto: CreateCleaningPriceDto,
    userId: string,
  ): Promise<SuccessResponseDto> {
    try {
      const result = await this.cleaningPriceRepository.create({
        ...createDto,
        createdBy: userId,
      });

      const response = new IdNameResponseDto(
        result.id,
        result.subscriptionFrequency,
      );

      return new SuccessResponseDto("Document created successfully", response);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error("Error creating new document:", error);
      throw new BadRequestException("Error creating new document");
    }
  }

  async findAll(): Promise<SuccessResponseDto> {
    try {
      const results = await this.cleaningPriceRepository.getAll({
        isActive: true,
      });

      return new SuccessResponseDto("All document fetched", results);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error("Error finding all document:", error);
      throw new BadRequestException("Could not get all document");
    }
  }

  async findOne(id: string): Promise<SuccessResponseDto> {
    try {
      const result = await this.cleaningPriceRepository.getOneById(id, {
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
        this.logger.error(`Document not found with ID: ${id}`, id);
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
    updateCleaningCouponDto: UpdateCleaningPriceDto,
    userId: string,
  ): Promise<SuccessResponseDto> {
    try {
      const result = await this.cleaningPriceRepository.updateOneById(
        id,
        {
          ...updateCleaningCouponDto,
          updatedBy: userId,
          updatedAt: new Date(),
        },
        { new: true },
      );

      if (!result) {
        this.logger.error(`Document not found with ID: ${id}`, id);
        throw new NotFoundException(`Could not find document with ID: ${id}`);
      }

      return new SuccessResponseDto("Document updated successfully", result);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error("Error updating document:", error);
      throw new BadRequestException("Error updating document");
    }
  }

  getSubscriptionFrequencies(): SuccessResponseDto {
    const subscriptionTypes = Object.values(
      CleaningSubscriptionFrequencyEnum,
    ).map((value) => ({
      label: value.replace(/([a-z])([A-Z])/g, "$1 $2"),
      value,
    }));

    const response = new SuccessResponseDto(
      "Types fetched successfully",
      subscriptionTypes,
    );
    return response;
  }
}
