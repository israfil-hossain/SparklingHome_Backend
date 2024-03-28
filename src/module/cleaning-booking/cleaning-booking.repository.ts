import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ApplicationUser } from "../application-user/entities/application-user.entity";
import { CleaningSubscription } from "../cleaning-subscription/entities/cleaning-subscription.entity";
import { GenericRepository } from "../common/repository/generic-repository";
import {
  CleaningBooking,
  CleaningBookingDocument,
  CleaningBookingType,
} from "./entities/cleaning-booking.entity";
import { CleaningBookingPaymentStatusEnum } from "./enum/cleaning-booking-payment-status.enum";
import { CleaningBookingStatusEnum } from "./enum/cleaning-booking-status.enum";

interface CleaningBookingDocumentWithSubscription
  extends CleaningBookingDocument {
  subscription?: CleaningSubscription;
}

@Injectable()
export class CleaningBookingRepository extends GenericRepository<CleaningBookingDocument> {
  private readonly logger: Logger;

  constructor(
    @InjectModel(CleaningBooking.name)
    private model: CleaningBookingType,
  ) {
    const logger = new Logger(CleaningBookingRepository.name);
    super(model, logger);
    this.logger = logger;
  }

  async getActiveBookingWithSubscriptionById(
    bookingId: string,
  ): Promise<CleaningBookingDocumentWithSubscription | null> {
    const modelAggregation = this.model
      .aggregate()
      .match({
        $expr: {
          $and: [
            { $eq: ["$_id", { $toObjectId: bookingId }] },
            { $eq: ["$isActive", true] },
            {
              $not: {
                $in: [
                  "$bookingStatus",
                  [
                    CleaningBookingStatusEnum.BookingCancelled,
                    CleaningBookingStatusEnum.BookingCompleted,
                  ],
                ],
              },
            },
            {
              $ne: [
                "$paymentStatus",
                CleaningBookingPaymentStatusEnum.PaymentCompleted,
              ],
            },
          ],
        },
      })
      .lookup({
        from: ApplicationUser.name.toLocaleLowerCase().concat("s"),
        let: { bookingUserId: "$bookingUser" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$isActive", true] },
                  {
                    $eq: [{ $toString: "$_id" }, "$$bookingUserId"],
                  },
                ],
              },
            },
          },
          {
            $project: {
              email: 1,
            },
          },
        ],
        as: "bookingUser",
      })
      .unwind("$bookingUser")
      .lookup({
        from: CleaningSubscription.name.toLowerCase().concat("s"),
        let: { bookingId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$isActive", true] },
                  {
                    $eq: [{ $toString: "$$bookingId" }, "$currentBooking"],
                  },
                ],
              },
            },
          },
          {
            $project: {
              subscriptionFrequency: 1,
            },
          },
        ],
        as: "subscription",
      })
      .unwind("$subscription");

    const result = await modelAggregation.exec();
    return result[0] || null;
  }

  async getTotalBookingEarnings(): Promise<number> {
    const modelAggregation = this.model
      .aggregate()
      .sort({ createdAt: -1 })
      .match({
        bookingStatus: CleaningBookingStatusEnum.BookingCompleted,
        paymentStatus: CleaningBookingPaymentStatusEnum.PaymentCompleted,
      })
      .group({
        _id: null,
        totalEarnings: {
          $sum: "$totalAmount",
        },
      });

    const result = await modelAggregation.exec();

    return result[0]?.totalEarnings ?? 0;
  }

  async findTopUsersByBooking() {
    const modelAggregation = this.model
      .aggregate()
      .match({
        bookingStatus: CleaningBookingStatusEnum.BookingCompleted,
        paymentStatus: CleaningBookingPaymentStatusEnum.PaymentCompleted,
      })
      .lookup({
        from: ApplicationUser.name.toLocaleLowerCase().concat("s"),
        let: { bookingUserId: "$bookingUser" },
        pipeline: [
          {
            $match: {
              isActive: true,
              $expr: {
                $eq: [
                  {
                    $toString: "$_id",
                  },
                  "$$bookingUserId",
                ],
              },
            },
          },
          {
            $project: {
              email: 1,
              fullName: 1,
              profilePicture: 1,
              dateJoined: 1,
            },
          },
        ],
        as: "bookingUser",
      })
      .unwind("$bookingUser")
      .group({
        _id: "$bookingUser",
        totalBookingCount: { $sum: 1 },
      })
      .sort({ totalBookingCount: -1 })
      .limit(10)
      .project({
        bookingUser: "$_id",
        totalBookingCount: 1,
        _id: 0,
      });

    const result = await modelAggregation.exec();
    return result;
  }
}
