import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { CleaningBookingRepository } from "../cleaning-booking/cleaning-booking.repository";
import { CleaningBookingDocument } from "../cleaning-booking/entities/cleaning-booking.entity";
import { CleaningCouponRepository } from "../cleaning-coupon/cleaning-coupon.repository";
import { EmailService } from "../email/email.service";
import { CleaningSubscriptionRepository } from "./cleaning-subscription.repository";
import { CleaningSubscriptionService } from "./cleaning-subscription.service";
import { CleaningSubscriptionDocument } from "./entities/cleaning-subscription.entity";
import { CleaningSubscriptionFrequencyEnum } from "./enum/cleaning-subscription-frequency.enum";

interface ICleaningBookingWithSubscription extends CleaningBookingDocument {
  subscription: CleaningSubscriptionDocument;
  bookingUserInfo: {
    email: string;
    fullName: string;
  };
}

@Injectable()
export class CleaningSubscriptionTask {
  private readonly logger: Logger = new Logger(CleaningSubscriptionTask.name);

  private isTaskRunning: boolean = false;

  constructor(
    private readonly cleaningSubscriptionRepository: CleaningSubscriptionRepository,
    private readonly cleaningSubscriptionService: CleaningSubscriptionService,
    private readonly cleaningCouponRepository: CleaningCouponRepository,
    private readonly cleaningBookingRepository: CleaningBookingRepository,
    private readonly emailService: EmailService,
  ) {}

  @Cron(CronExpression.EVERY_4_HOURS)
  async subscriptionUpdateTask() {
    if (this.isTaskRunning) return;

    this.isTaskRunning = true;
    this.logger.log("Running subscription update task");

    await this.updateSubscriptionBookings();

    this.isTaskRunning = false;
    this.logger.log("Finished subscription update task");
  }

  //#region Private helper methos
  private getNextScheduleDate(
    previousDate: Date,
    frequency: CleaningSubscriptionFrequencyEnum,
  ): Date {
    const currentDate = new Date(previousDate);

    switch (frequency) {
      case CleaningSubscriptionFrequencyEnum.WEEKLY:
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case CleaningSubscriptionFrequencyEnum.BIWEEKLY:
        currentDate.setDate(currentDate.getDate() + 14);
        break;
      case CleaningSubscriptionFrequencyEnum.MONTHLY:
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      default:
        throw new Error("Invalid frequency provided");
    }

    return currentDate;
  }

  private async renewBookingFromPrev(
    booking: ICleaningBookingWithSubscription,
  ) {
    try {
      if (!booking.subscription) {
        throw new Error("Booking does not have a subscription");
      }
      const subscription = booking.subscription;

      const cleaningCoupon = await this.cleaningCouponRepository.getOneById(
        subscription.cleaningCoupon,
      );

      const nextScheduleDate = this.getNextScheduleDate(
        booking.cleaningDate,
        subscription.subscriptionFrequency,
      );

      const newBooking =
        await this.cleaningSubscriptionService.createBookingFromSubscription(
          subscription,
          cleaningCoupon,
          nextScheduleDate,
        );

      await this.cleaningSubscriptionRepository.updateOneById(
        subscription?._id?.toString(),
        {
          currentBooking: newBooking.id,
          updatedAt: new Date(),
        },
      );

      await this.cleaningBookingRepository.updateOneById(booking.id, {
        isActive: false,
        updatedAt: new Date(),
      });

      this.emailService.sendBookingRenewedMail(
        booking.bookingUserInfo.email,
        booking.bookingUserInfo.fullName,
        newBooking.cleaningDate,
        newBooking.cleaningDuration,
      );
    } catch (_) {}
  }

  private async updateSubscriptionBookings() {
    const expiredBookings =
      await this.cleaningBookingRepository.findAllExpiredBooking();
    expiredBookings.forEach(this.renewBookingFromPrev);
  }

  //#endregion
}
