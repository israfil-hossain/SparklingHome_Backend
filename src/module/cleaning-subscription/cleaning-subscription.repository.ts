import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ApplicationUser } from "../application-user/entities/application-user.entity";
import { CleaningBooking } from "../cleaning-booking/entities/cleaning-booking.entity";
import { CleaningBookingPaymentStatusEnum } from "../cleaning-booking/enum/cleaning-booking-payment-status.enum";
import { CleaningBookingStatusEnum } from "../cleaning-booking/enum/cleaning-booking-status.enum";
import { GenericRepository } from "../common/repository/generic-repository";
import {
  CleaningSubscription,
  CleaningSubscriptionDocument,
  CleaningSubscriptionType,
} from "./entities/cleaning-subscription.entity";
import { CleaningSubscriptionFrequencyEnum } from "./enum/cleaning-subscription-frequency.enum";

@Injectable()
export class CleaningSubscriptionRepository extends GenericRepository<CleaningSubscriptionDocument> {
  private readonly logger: Logger;

  constructor(
    @InjectModel(CleaningSubscription.name)
    private model: CleaningSubscriptionType,
  ) {
    const logger = new Logger(CleaningSubscriptionRepository.name);
    super(model, logger);
    this.logger = logger;
  }

  async getAllSubscriptionsForBookingReminderNotification(): Promise<
    CleaningSubscriptionDocument[]
  > {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const startDate = new Date(today);
      startDate.setDate(today.getDate() + 4);

      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 5);

      const modelAggregation = this.model
        .aggregate()
        .match({
          isActive: true,
        })
        .lookup({
          from: CleaningBooking.name.toLowerCase().concat("s"),
          let: { currentBookingId: "$currentBooking" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$$currentBookingId", { $toString: "$_id" }] },
                    { $eq: ["$isActive", true] },
                    {
                      $and: [
                        { $gte: ["$cleaningDate", startDate] },
                        { $lt: ["$cleaningDate", endDate] },
                      ],
                    },
                  ],
                },
              },
            },
            {
              $project: {
                cleaningDate: 1,
              },
            },
          ],
          as: "currentBooking",
        })
        .unwind("$currentBooking")
        .lookup({
          from: ApplicationUser.name.toLocaleLowerCase().concat("s"),
          let: { subscribedUserId: "$subscribedUser" },
          pipeline: [
            {
              $match: {
                isActive: true,
                $expr: {
                  $eq: [
                    {
                      $toString: "$_id",
                    },
                    "$$subscribedUserId",
                  ],
                },
              },
            },
            {
              $project: {
                email: 1,
                fullName: 1,
              },
            },
          ],
          as: "subscribedUser",
        })
        .unwind("$subscribedUser");

      const result = await modelAggregation.exec();
      return result;
    } catch (error) {
      this.logger.error("Error finding subscriptions for notification:", error);
      return [];
    }
  }

  async getAllSubscriptionsForBookingRenew(): Promise<
    CleaningSubscriptionDocument[]
  > {
    try {
      const cleaningDateLookup = new Date();
      cleaningDateLookup.setHours(0, 0, 0, 0);
      cleaningDateLookup.setDate(cleaningDateLookup.getDate() - 1);

      const modelAggregation = this.model
        .aggregate()
        .lookup({
          from: CleaningBooking.name.toLowerCase().concat("s"),
          let: { currentBookingId: "$currentBooking" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$$currentBookingId", { $toString: "$_id" }] },
                    { $eq: ["$isActive", true] },
                    { $lte: ["$cleaningDate", cleaningDateLookup] },
                    {
                      $eq: [
                        "$bookingStatus",
                        CleaningBookingStatusEnum.BookingCompleted,
                      ],
                    },
                    {
                      $eq: [
                        "$paymentStatus",
                        CleaningBookingPaymentStatusEnum.PaymentCompleted,
                      ],
                    },
                  ],
                },
              },
            },
          ],
          as: "currentBooking",
        })
        .unwind("$currentBooking")
        .lookup({
          from: ApplicationUser.name.toLocaleLowerCase().concat("s"),
          let: { subscribedUserId: "$subscribedUser" },
          pipeline: [
            {
              $match: {
                isActive: true,
                $expr: {
                  $eq: [
                    {
                      $toString: "$_id",
                    },
                    "$$subscribedUserId",
                  ],
                },
              },
            },
            {
              $project: {
                email: 1,
                fullName: 1,
              },
            },
          ],
          as: "subscribedUser",
        })
        .unwind("$subscribedUser")
        .match({
          isActive: true,
          subscriptionFrequency: {
            $ne: CleaningSubscriptionFrequencyEnum.ONETIME,
          },
        });

      const result = await modelAggregation.exec();
      return result;
    } catch (error) {
      this.logger.error("Error finding subscriptions for renew:", error);
      return [];
    }
  }
}
