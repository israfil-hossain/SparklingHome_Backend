import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { CleaningBookingRepository } from "../cleaning-booking/cleaning-booking.repository";
import { CleaningPriceRepository } from "../cleaning-price/cleaning-price.repository";
import { IdNameResponseDto } from "../common/dto/id-name-respones.dto";
import { SuccessResponseDto } from "../common/dto/success-response.dto";
import { CleaningSubscriptionRepository } from "./cleaning-subscription.repository";
import { CreateCleaningSubscriptionDto } from "./dto/create-cleaning-subscription.dto";
import { CleaningSubscriptionFrequencyEnum } from "./enum/cleaning-subscription-frequency.enum";

@Injectable()
export class CleaningSubscriptionService {
  private readonly logger: Logger = new Logger(
    CleaningSubscriptionService.name,
  );

  constructor(
    private readonly cleaningSubscriptionRepository: CleaningSubscriptionRepository,
    private readonly cleaningBookingRepository: CleaningBookingRepository,
    private readonly cleaningPriceRepository: CleaningPriceRepository,
  ) {}

  async create(
    createDto: CreateCleaningSubscriptionDto,
    userId: string,
  ): Promise<SuccessResponseDto> {
    try {
      const existingSubscription =
        await this.cleaningSubscriptionRepository.getOneWhere({
          subscribedUser: userId,
          isActive: true,
        });

      if (existingSubscription) {
        throw new BadRequestException("You already have a subscription");
      }

      const cleaningPrice = await this.cleaningPriceRepository.getOneById(
        createDto.cleaningPrice,
      );

      if (!cleaningPrice || !cleaningPrice.subscriptionPrice) {
        throw new BadRequestException("Cleaning price not valid");
      }

      const result = await this.cleaningSubscriptionRepository.create({
        ...createDto,
        cleaningPrice: cleaningPrice.id,
        createdBy: userId,
        subscribedUser: userId,
      });

      // Price calculations
      const cleaningDurationInHours = result.cleaningDurationInHours;
      const cleaningPricePerHour = cleaningPrice.subscriptionPrice;
      const couponDiscountAmount = result.couponDiscount;
      const totalCleaningPrice = Math.ceil(
        cleaningDurationInHours * cleaningPricePerHour - couponDiscountAmount,
      );

      try {
        const newBooking = await this.cleaningBookingRepository.create({
          cleaningDate: result.startDate,
          cleaningDuration: cleaningDurationInHours,
          cleaningPrice: cleaningPrice.id,
          discountAmount: couponDiscountAmount,
          totalAmount: totalCleaningPrice,
          createdBy: userId,
        });

        await this.cleaningSubscriptionRepository.updateOneById(result.id, {
          currentBooking: newBooking.id,
        });
      } catch (error) {
        await this.cleaningSubscriptionRepository.removeOneById(result.id);
        throw error;
      }

      const response = new IdNameResponseDto(result.id);
      return new SuccessResponseDto("Document created successfully", response);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error("Error creating new document:", error);
      throw new BadRequestException("Error creating new document");
    }
  }

  async getUserSubscription(userId: string): Promise<SuccessResponseDto> {
    try {
      const subscription =
        await this.cleaningSubscriptionRepository.getOneWhere(
          {
            subscribedUser: userId,
            isActive: true,
          },
          {
            populate: ["cleaningPrice", "currentBooking"],
          },
        );

      return new SuccessResponseDto(
        "Subscription fetched successfully",
        subscription,
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error("Error finding document:", error);
      throw new BadRequestException("Could not get document");
    }
  }

  getAllCleaningSubscriptionTypes(): SuccessResponseDto {
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
