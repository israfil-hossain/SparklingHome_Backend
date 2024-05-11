import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ApplicationUser } from "../application-user/entities/application-user.entity";
import { GenericRepository } from "../common/repository/generic-repository";
import { PaymentReceive } from "../payment-receive/entities/payment-receive.entity";
import { ListCleaningBookingQueryDto } from "./dto/list-cleaning-booking-query.dto";
import {
  CleaningBooking,
  CleaningBookingDocument,
  CleaningBookingType,
} from "./entities/cleaning-booking.entity";
import { CleaningBookingPaymentStatusEnum } from "./enum/cleaning-booking-payment-status.enum";
import { CleaningBookingStatusEnum } from "./enum/cleaning-booking-status.enum";

interface ICleaningBookingFilterResult {
  count: number;
  results: CleaningBookingDocument[];
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

  async getAllPaidBookingsByFilter(
    queryDto: ListCleaningBookingQueryDto,
  ): Promise<ICleaningBookingFilterResult> {
    try {
      const page = queryDto.Page || 1;
      const size = queryDto.PageSize || 10;
      const skip = (page - 1) * size;

      const bookingFilterQuery: any = {
        bookingStatus: CleaningBookingStatusEnum.BookingCompleted,
        paymentStatus: CleaningBookingPaymentStatusEnum.PaymentCompleted,
        ...(queryDto.BookingUserId && {
          bookingUser: queryDto.BookingUserId,
        }),
        ...(queryDto.PaymentFromDate || queryDto.PaymentToDate
          ? {
              "paymentReceive.paymentDate": {
                ...(queryDto.PaymentFromDate && {
                  $gte: new Date(queryDto.PaymentFromDate),
                }),
                ...(queryDto.PaymentToDate && {
                  $lte: new Date(queryDto.PaymentToDate),
                }),
              },
            }
          : {}),
      };

      const modelAggregation = this.model
        .aggregate()
        .lookup({
          from: PaymentReceive.name.toLocaleLowerCase().concat("s"),
          let: { paymentReceiveId: "$paymentReceive" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: [{ $toString: "$_id" }, "$$paymentReceiveId"] },
                  ],
                },
              },
            },
            {
              $unset: [
                "lastPaymentEvent",
                "paymentRedirectUrl",
                "paymentIntentId",
              ],
            },
          ],
          as: "paymentReceive",
        })
        .unwind("$paymentReceive")
        .match(bookingFilterQuery)
        .sort({
          "paymentReceive.paymentDate": -1,
        })
        .group({
          _id: null,
          count: { $sum: 1 },
          results: { $push: "$$ROOT" },
        })
        .project({
          count: 1,
          results: { $slice: ["$results", skip, size] },
        });

      const aggregationResult = await modelAggregation.exec();

      const queryResult: ICleaningBookingFilterResult =
        aggregationResult.length > 0
          ? aggregationResult[0]
          : { count: 0, results: [] };

      return queryResult;
    } catch (error) {
      this.logger.error("Error finding subscriptions by filter: ", error);
      return {
        count: 0,
        results: [],
      };
    }
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
