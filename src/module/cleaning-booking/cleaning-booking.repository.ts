import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { CleaningSubscription } from "../cleaning-subscription/entities/cleaning-subscription.entity";
import { CleaningSubscriptionFrequencyEnum } from "../cleaning-subscription/enum/cleaning-subscription-frequency.enum";
import { GenericRepository } from "../common/repository/generic-repository";
import {
  CleaningBooking,
  CleaningBookingDocument,
  CleaningBookingType,
} from "./entities/cleaning-booking.entity";

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

  async findAllExpiredBooking(): Promise<CleaningBookingDocument[]> {
    const currentDate = new Date();
    const modelAggregation = this.model
      .aggregate()
      .sort({ createdAt: -1 })
      .lookup({
        from: CleaningSubscription.name.toLocaleLowerCase().concat("s"),
        let: { bookingId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: [
                  {
                    $toString: "$$bookingId",
                  },
                  "$currentBooking",
                ],
              },
              isActive: true,
              subscriptionFrequency: {
                $ne: CleaningSubscriptionFrequencyEnum.ONETIME,
              },
            },
          },
        ],
        as: "subscription",
      })
      .unwind("$subscription")
      .match({
        "subscription.isActive": true,
        isActive: true,
        $expr: {
          $lt: [
            "$cleaningDate",
            {
              $switch: {
                branches: [
                  {
                    case: {
                      $eq: [
                        "$subscription.subscriptionFrequency",
                        CleaningSubscriptionFrequencyEnum.WEEKLY,
                      ],
                    },
                    then: { $subtract: [currentDate, 604800000] },
                  },
                  {
                    case: {
                      $eq: [
                        "$subscription.subscriptionFrequency",
                        CleaningSubscriptionFrequencyEnum.BIWEEKLY,
                      ],
                    },
                    then: { $subtract: [currentDate, 1209600000] },
                  },
                  {
                    case: {
                      $eq: [
                        "$subscription.subscriptionFrequency",
                        CleaningSubscriptionFrequencyEnum.MONTHLY,
                      ],
                    },
                    then: { $subtract: [currentDate, 2419200000] },
                  },
                ],
                default: null,
              },
            },
          ],
        },
      })
      .lookup({
        from: "applicationusers",
        let: { bookingUserId: "$bookingUser" },
        pipeline: [
          {
            $match: {
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
            },
          },
        ],
        as: "bookingUserInfo",
      })
      .unwind("$bookingUserInfo");

    const result = await modelAggregation.exec();
    return result;
  }
}
