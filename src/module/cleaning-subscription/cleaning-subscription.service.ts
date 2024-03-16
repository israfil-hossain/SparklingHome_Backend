import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { ApplicationUserRepository } from "../application-user/application-user.repository";
import { ApplicationUserDocument } from "../application-user/entities/application-user.entity";
import { ApplicationUserRoleEnum } from "../application-user/enum/application-user-role.enum";
import { CleaningBookingRepository } from "../cleaning-booking/cleaning-booking.repository";
import { CleaningCouponRepository } from "../cleaning-coupon/cleaning-coupon.repository";
import { CleaningPriceRepository } from "../cleaning-price/cleaning-price.repository";
import { IdNameResponseDto } from "../common/dto/id-name-respones.dto";
import { SuccessResponseDto } from "../common/dto/success-response.dto";
import { ConfigurationRepository } from "../configuration/configuration.repository";
import { EncryptionService } from "../encryption/encryption.service";
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
    private readonly cleaningCouponRepository: CleaningCouponRepository,
    private readonly configurationRepository: ConfigurationRepository,
    private readonly applicationUserRepository: ApplicationUserRepository,
    private readonly encryptionService: EncryptionService,
  ) {}

  async addSubscription(
    createDto: CreateCleaningSubscriptionDto,
  ): Promise<SuccessResponseDto> {
    try {
      let subscriptionUser: ApplicationUserDocument;

      const existingUser = await this.applicationUserRepository.getOneWhere({
        email: createDto.userEmail,
        role: ApplicationUserRoleEnum.USER,
      });

      if (existingUser) {
        const existingSubscription =
          await this.cleaningSubscriptionRepository.getOneWhere({
            subscribedUser: existingUser?.id,
            isActive: true,
          });

        if (existingSubscription) {
          throw new BadRequestException("You already have a subscription");
        }

        subscriptionUser = existingUser;
      } else {
        const userPassword = "dummyPassword@123";
        const userPasswordHash =
          await this.encryptionService.hashPassword(userPassword);

        subscriptionUser = await this.applicationUserRepository.create({
          email: createDto.userEmail,
          fullName: createDto.userFullName,
          phoneNumber: createDto.userPhoneNumber,
          pidNumber: createDto.userPidNumber,
          role: ApplicationUserRoleEnum.USER,
          password: userPasswordHash,
        });
      }

      const cleaningPrice = await this.cleaningPriceRepository.getOneById(
        createDto.cleaningPrice,
      );

      if (!cleaningPrice || !cleaningPrice.subscriptionPrice) {
        throw new BadRequestException("Cleaning price not valid");
      }

      let cleaningCoupon = null;
      if (createDto?.cleaningCoupon) {
        cleaningCoupon = await this.cleaningCouponRepository.getOneById(
          createDto?.cleaningCoupon,
        );
      }

      const newSubscription = await this.cleaningSubscriptionRepository.create({
        ...createDto,
        cleaningPrice: cleaningPrice.id,
        cleaningCoupon: cleaningCoupon?.id,
        createdBy: subscriptionUser.id,
        subscribedUser: subscriptionUser.id,
      });

      try {
        const latestConfig = await this.configurationRepository.getOneWhere(
          {},
          { sort: { updatedAt: -1, createdAt: -1 } },
        );

        // Price calculations
        const cleaningDurationInHours = newSubscription.cleaningDurationInHours;
        const cleaningPricePerHour = cleaningPrice.subscriptionPrice;
        const totalCleaningPrice =
          cleaningDurationInHours * cleaningPricePerHour;

        // Coupon Discount Calculations
        let couponDiscountAmount = 0;
        if (cleaningCoupon) {
          const discountAmount =
            totalCleaningPrice * (cleaningCoupon.discountPercentage / 100);
          couponDiscountAmount = Math.min(
            discountAmount,
            cleaningCoupon.maximumDiscount,
          );
        }

        // Final Cleaning Price Calculations
        const suppliesCharge = latestConfig?.suppliesCharge ?? 0;
        const finalCleaningPrice = Math.ceil(
          totalCleaningPrice + suppliesCharge - couponDiscountAmount,
        );

        const newBooking = await this.cleaningBookingRepository.create({
          cleaningDate: newSubscription.startDate,
          cleaningDuration: cleaningDurationInHours,
          cleaningPrice: cleaningPrice.id,
          discountAmount: couponDiscountAmount,
          totalAmount: finalCleaningPrice,
          suppliesCharges: suppliesCharge,
          createdBy: subscriptionUser.id,
        });

        await this.cleaningSubscriptionRepository.updateOneById(
          newSubscription.id,
          {
            currentBooking: newBooking.id,
          },
        );
      } catch (error) {
        await this.cleaningSubscriptionRepository.removeOneById(
          newSubscription.id,
        );
        throw error;
      }

      const response = new IdNameResponseDto(newSubscription.id);
      return new SuccessResponseDto(
        "Subscription created successfully",
        response,
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error("Error creating new subscription:", error);
      throw new BadRequestException("Error creating new subscription");
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
