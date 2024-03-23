import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { FilterQuery } from "mongoose";
import { ApplicationUserRepository } from "../application-user/application-user.repository";
import { ApplicationUserRoleEnum } from "../application-user/enum/application-user-role.enum";
import { CleaningBookingRepository } from "../cleaning-booking/cleaning-booking.repository";
import { CleaningBookingDocument } from "../cleaning-booking/entities/cleaning-booking.entity";
import { CleaningBookingStatusEnum } from "../cleaning-booking/enum/cleaning-booking-status.enum";
import { CleaningCouponRepository } from "../cleaning-coupon/cleaning-coupon.repository";
import { CleaningCouponDocument } from "../cleaning-coupon/entities/cleaning-coupon.entity";
import { CleaningPriceRepository } from "../cleaning-price/cleaning-price.repository";
import { IdNameResponseDto } from "../common/dto/id-name-respones.dto";
import { PaginatedResponseDto } from "../common/dto/paginated-response.dto";
import { SuccessResponseDto } from "../common/dto/success-response.dto";
import { ConfigurationRepository } from "../configuration/configuration.repository";
import { EmailService } from "../email/email.service";
import { EncryptionService } from "../encryption/encryption.service";
import { CleaningSubscriptionRepository } from "./cleaning-subscription.repository";
import { CreateCleaningSubscriptionDto } from "./dto/create-cleaning-subscription.dto";
import { ListCleaningSubscriptionQueryDto } from "./dto/list-cleaning-subscription-query.dto";
import { CleaningSubscriptionDocument } from "./entities/cleaning-subscription.entity";

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
    private readonly emailService: EmailService,
  ) {}

  async getUserSubscription(userId: string): Promise<SuccessResponseDto> {
    try {
      const subscription =
        await this.cleaningSubscriptionRepository.getOneWhere(
          {
            subscribedUser: userId,
            isActive: true,
          },
          {
            populate: [
              {
                path: "subscribedUser",
                select: "-role -isActive -password -isPasswordLess",
                populate: [
                  {
                    path: "profilePicture",
                    select: "url",
                    transform: (doc) => doc?.url ?? null,
                  },
                ],
              },
              {
                path: "cleaningCoupon",
                select: "couponCode",
              },
              {
                path: "currentBooking",
                select:
                  "-isActive -createdAt -createdBy -updatedAt -updatedBy -paymentReceive",
              },
            ],
          },
        );

      if (!subscription) {
        throw new BadRequestException("No active subscription found");
      }

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

  async addSubscription(
    createDto: CreateCleaningSubscriptionDto,
  ): Promise<SuccessResponseDto> {
    try {
      let subscriptionUser = await this.applicationUserRepository.getOneWhere({
        email: createDto.userEmail,
        role: ApplicationUserRoleEnum.USER,
      });

      if (subscriptionUser) {
        if (!subscriptionUser.isActive) {
          await this.applicationUserRepository.updateOneById(
            subscriptionUser.id,
            {
              isActive: true,
            },
          );
        }

        const existingSubscription =
          await this.cleaningSubscriptionRepository.getOneWhere({
            subscribedUser: subscriptionUser?.id,
            isActive: true,
          });

        if (existingSubscription) {
          throw new BadRequestException("You already have a subscription");
        }
      } else {
        const userPassword = this.encryptionService.generateTemporaryPassword();
        const userPasswordHash =
          await this.encryptionService.hashPassword(userPassword);

        subscriptionUser = await this.applicationUserRepository.create({
          email: createDto.userEmail,
          fullName: createDto.userFullName,
          phoneNumber: createDto.userPhoneNumber,
          pidNumber: createDto.userPidNumber,
          address: createDto.address,
          role: ApplicationUserRoleEnum.USER,
          password: userPasswordHash,
        });

        this.logger.warn(
          `New user created from subscription with these credentials: `,
          {
            newUserName: subscriptionUser.fullName,
            newUserEmail: subscriptionUser.email,
            newUserPassword: userPassword,
          },
        );
        this.emailService.sendUserCredentialsMail(
          subscriptionUser.email,
          subscriptionUser.fullName ?? "User",
          userPassword,
        );
      }

      let cleaningCoupon: CleaningCouponDocument | null = null;
      if (createDto?.cleaningCoupon) {
        cleaningCoupon = await this.cleaningCouponRepository.getOneWhere({
          _id: createDto?.cleaningCoupon,
          isActive: true,
        });

        if (!cleaningCoupon || !cleaningCoupon.id) {
          throw new BadRequestException("Cleaning coupon not valid");
        }
      }

      const newSubscription = await this.cleaningSubscriptionRepository.create({
        ...createDto,
        cleaningCoupon: cleaningCoupon?.id,
        subscriptionFrequency: createDto.subscriptionFrequency,
        createdBy: subscriptionUser.id,
        subscribedUser: subscriptionUser.id,
      });

      try {
        const newBooking = await this.createBookingFromSubscription(
          newSubscription,
          cleaningCoupon,
        );

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

  async cancelSubscription(
    { userId, userRole }: ITokenPayload,
    subscriptionId: string,
  ): Promise<SuccessResponseDto> {
    try {
      const subscriptionQuery: FilterQuery<CleaningSubscriptionDocument> = {
        _id: subscriptionId,
        isActive: true,
      };

      if (userRole !== ApplicationUserRoleEnum.ADMIN) {
        subscriptionQuery.subscribedUser = userId;
      }

      const subscription =
        await this.cleaningSubscriptionRepository.getOneWhere(
          subscriptionQuery,
        );

      if (!subscription)
        throw new BadRequestException(
          "No active subscription found with id: " + subscriptionId,
        );

      await this.cleaningSubscriptionRepository.updateOneById(subscription.id, {
        isActive: false,
        updatedBy: userId,
        updatedAt: new Date(),
      });

      if (subscription.currentBooking) {
        await this.cleaningBookingRepository.updateOneById(
          subscription.currentBooking,
          {
            bookingStatus: CleaningBookingStatusEnum.BookingCancelled,
            isActive: false,
            updatedBy: userId,
            updatedAt: new Date(),
          },
        );
      }

      return new SuccessResponseDto("Subscription cancelled successfully");
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error("Error cancelling subscription:", error);
      throw new BadRequestException("Could not cancel subscription");
    }
  }

  async findAll({
    Page = 1,
    PageSize = 10,
    Frequency,
  }: ListCleaningSubscriptionQueryDto): Promise<PaginatedResponseDto> {
    try {
      // Search query setup
      const searchQuery: FilterQuery<CleaningSubscriptionDocument> = {};
      if (Frequency) {
        searchQuery.subscriptionFrequency = Frequency;
      }

      // Pagination setup
      const totalRecords =
        await this.cleaningSubscriptionRepository.count(searchQuery);
      const skip = (Page - 1) * PageSize;

      const result = await this.cleaningSubscriptionRepository.getAll(
        searchQuery,
        {
          limit: PageSize,
          skip,
          populate: [
            {
              path: "subscribedUser",
              select: "-role -isActive -password -isPasswordLess",
              populate: [
                {
                  path: "profilePicture",
                  select: "url",
                  transform: (doc) => doc?.url ?? null,
                },
              ],
            },
            {
              path: "currentBooking",
              select:
                "-isActive -createdAt -createdBy -updatedAt -updatedBy -paymentReceive",
            },
          ],
        },
      );

      return new PaginatedResponseDto(totalRecords, Page, PageSize, result);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error("Error finding users:", error);
      throw new BadRequestException("Could not get all users");
    }
  }

  async findOne(id: string): Promise<SuccessResponseDto> {
    try {
      const result = await this.cleaningSubscriptionRepository.getOneById(id, {
        populate: [
          {
            path: "subscribedUser",
            select: "-role -isActive -password -isPasswordLess",
            populate: "profilePicture",
          },
          {
            path: "cleaningCoupon",
            select: "couponCode",
          },
          {
            path: "currentBooking",
            select:
              "-isActive -createdAt -createdBy -updatedAt -updatedBy -paymentReceive",
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

      this.logger.error(`Error finding document with id ${id}:`, error);
      throw new BadRequestException("Could not get document with id: " + id);
    }
  }

  //#region Shared internal methods
  async createBookingFromSubscription(
    subscription: CleaningSubscriptionDocument,
    coupon?: CleaningCouponDocument | null,
    cleaningDate?: Date | null,
  ): Promise<CleaningBookingDocument> {
    const cleaningPrice = await this.cleaningPriceRepository.getOneWhere({
      subscriptionFrequency: subscription.subscriptionFrequency,
      isActive: true,
    });

    if (!cleaningPrice || !cleaningPrice.subscriptionPrice) {
      throw new BadRequestException("Cleaning price not valid");
    }

    const latestConfig = await this.configurationRepository.getOneWhere(
      {},
      { sort: { updatedAt: -1, createdAt: -1 } },
    );

    // Price calculations
    const cleaningDurationInHours = subscription.cleaningDurationInHours;
    const cleaningPricePerHour = cleaningPrice.subscriptionPrice;
    const totalCleaningPrice = cleaningDurationInHours * cleaningPricePerHour;

    // Coupon Discount Calculations
    let couponDiscountAmount = 0;
    if (coupon) {
      const discountAmount =
        totalCleaningPrice * (coupon.discountPercentage / 100);
      couponDiscountAmount = Math.min(discountAmount, coupon.maximumDiscount);
    }

    // Final Cleaning Price Calculations
    const suppliesChargeAmount = latestConfig?.suppliesCharge ?? 0;
    const finalCleaningPrice = Math.ceil(
      totalCleaningPrice + suppliesChargeAmount - couponDiscountAmount,
    );

    const newBooking = await this.cleaningBookingRepository.create({
      bookingUser: subscription.subscribedUser,
      cleaningDate: cleaningDate ?? subscription.startDate,
      cleaningDuration: cleaningDurationInHours,
      cleaningPrice: totalCleaningPrice,
      discountAmount: couponDiscountAmount,
      suppliesCharges: suppliesChargeAmount,
      totalAmount: finalCleaningPrice,
      createdBy: subscription.subscribedUser,
    });

    return newBooking;
  }
  //#endregion
}
