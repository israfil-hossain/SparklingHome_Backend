import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { CleaningSubscriptionFrequencyEnum } from "../cleaning-subscription/enum/cleaning-subscription-frequency.enum";
import { IdNameResponseDto } from "../common/dto/id-name-respones.dto";
import { SuccessResponseDto } from "../common/dto/success-response.dto";
import { CleaningPriceRepository } from "./cleaning-price.repository";
import { CreateCleaningPriceDto } from "./dto/create-cleaning-price.dto";

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
      const results = await this.cleaningPriceRepository.getAll();

      return new SuccessResponseDto("All document fetched", results);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error("Error finding all document:", error);
      throw new BadRequestException("Could not get all document");
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
