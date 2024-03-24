import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { FilterQuery } from "mongoose";
import { ApplicationUserRepository } from "../application-user/application-user.repository";
import { ApplicationUserDocument } from "../application-user/entities/application-user.entity";
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
import { UpdateCleaningSubscriptionDto } from "./dto/update-cleaning-subscription.dto";
import { CleaningSubscriptionDocument } from "./entities/cleaning-subscription.entity";
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

      const nextScheduleDate = this.getNextScheduleDate(
        createDto.startDate,
        createDto.subscriptionFrequency,
      );

      const newSubscription = await this.cleaningSubscriptionRepository.create({
        ...createDto,
        cleaningCoupon: cleaningCoupon?.id,
        subscriptionFrequency: createDto.subscriptionFrequency,
        createdBy: subscriptionUser.id,
        subscribedUser: subscriptionUser.id,
        nextScheduleDate: nextScheduleDate,
      });

      try {
        const newBooking = await this.createBookingFromSubscription(
          newSubscription,
          newSubscription.startDate,
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

      this.emailService.sendNewSubscriptionMail(
        subscriptionUser.email,
        subscriptionUser.fullName ?? "User",
        newSubscription.subscriptionFrequency,
        newSubscription.startDate,
      );

      this.emailService.sendNewSubscriptionMailToAdmin(
        subscriptionUser.email,
        subscriptionUser.fullName ?? "User",
        newSubscription.id,
        newSubscription.subscriptionFrequency,
        newSubscription.startDate,
      );

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

  async updateSubscription(
    subscriptionId: string,
    updateDto: UpdateCleaningSubscriptionDto,
    { userId, userRole }: ITokenPayload,
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
          {
            populate: ["currentBooking", "cleaningCoupon", "subscribedUser"],
          },
        );

      if (!subscription)
        throw new BadRequestException(
          "No active subscription found with id: " + subscriptionId,
        );

      if (updateDto.nextScheduleDate) {
        if (
          subscription.subscriptionFrequency ===
          CleaningSubscriptionFrequencyEnum.ONETIME
        )
          throw new BadRequestException(
            "Cannot change next schedule date for onetime subscription",
          );

        if (
          subscription.nextScheduleDate &&
          new Date(subscription.nextScheduleDate).getTime() >
            new Date(updateDto.nextScheduleDate).getTime()
        ) {
          throw new BadRequestException(
            "Next schedule date cannot be before current schedule date",
          );
        }

        const subscribedUser =
          subscription.subscribedUser as unknown as ApplicationUserDocument;
        this.emailService.sendRescheduleNotification(
          subscribedUser.email,
          subscribedUser.fullName ?? "User",
          updateDto.nextScheduleDate,
        );
      }

      const updateSubscription =
        await this.cleaningSubscriptionRepository.updateOneById(
          subscription.id,
          {
            ...updateDto,
            updatedBy: userId,
            updatedAt: new Date(),
          },
        );

      if (updateDto.cleaningDurationInHours) {
        const currentBooking =
          subscription.currentBooking as unknown as CleaningBookingDocument;

        if (!currentBooking)
          throw new BadRequestException(
            "No active booking found with id: " + subscriptionId,
          );

        if (
          currentBooking.bookingStatus ===
            CleaningBookingStatusEnum.BookingInitiated &&
          currentBooking.cleaningDuration !==
            updateSubscription.cleaningDurationInHours
        ) {
          const cleaningCoupon =
            subscription.cleaningCoupon as unknown as CleaningCouponDocument;

          const newBooking = await this.createBookingFromSubscription(
            updateSubscription,
            updateSubscription.startDate,
            cleaningCoupon,
          );

          await this.cleaningBookingRepository.updateOneById(
            currentBooking.id,
            {
              isActive: false,
              updatedBy: userId,
              updatedAt: new Date(),
            },
          );

          await this.cleaningSubscriptionRepository.updateOneById(
            subscription._id.toString(),
            {
              currentBooking: newBooking._id?.toString(),
              updatedBy: userId,
              updatedAt: new Date(),
            },
          );
        }
      }

      const result = new IdNameResponseDto(subscription.id);
      return new SuccessResponseDto(
        "Subscription updated successfully",
        result,
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error("Error updating subscription:", error);
      throw new BadRequestException("Could not updated subscription");
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
          sort: {
            createdAt: -1,
          },
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
  getNextScheduleDate(
    previousDate: Date,
    frequency: CleaningSubscriptionFrequencyEnum,
  ): Date | null {
    const currentDate = new Date();

    const nextScheduleDate = new Date(previousDate);
    switch (frequency) {
      case CleaningSubscriptionFrequencyEnum.WEEKLY:
        nextScheduleDate.setDate(nextScheduleDate.getDate() + 7);
        break;
      case CleaningSubscriptionFrequencyEnum.BIWEEKLY:
        nextScheduleDate.setDate(nextScheduleDate.getDate() + 14);
        break;
      case CleaningSubscriptionFrequencyEnum.MONTHLY:
        nextScheduleDate.setMonth(nextScheduleDate.getMonth() + 1);
        break;
      default:
        return null;
    }

    if (nextScheduleDate < currentDate) {
      return new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() + 2,
        nextScheduleDate.getHours(),
        nextScheduleDate.getMinutes(),
        nextScheduleDate.getSeconds(),
        nextScheduleDate.getMilliseconds(),
      );
    }

    return nextScheduleDate;
  }

  async createBookingFromSubscription(
    subscription: CleaningSubscriptionDocument,
    cleaningScheduleDate: Date,
    coupon?: CleaningCouponDocument | null,
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
      cleaningDate: cleaningScheduleDate,
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
