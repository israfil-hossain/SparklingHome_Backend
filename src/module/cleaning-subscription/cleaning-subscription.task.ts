import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ApplicationUserDocument } from "../application-user/entities/application-user.entity";
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
  bookingUserInfo: ApplicationUserDocument;
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

    await this.notifyUsersForUpcomingBookings();
    await this.renewSubsciptionBookings();

    this.isTaskRunning = false;
    this.logger.log("Finished subscription update task");
  }

  //#region Private helper methods
  private async renewSubsciptionBookings() {
    const expiredBookings =
      await this.cleaningBookingRepository.findAllExpiredBooking();
    expiredBookings.forEach(
      async (booking: ICleaningBookingWithSubscription) => {
        try {
          if (!booking.subscription) {
            throw new Error("Booking does not have a subscription");
          }
          const subscription = booking.subscription;

          const cleaningCoupon =
            await this.cleaningCouponRepository.getOneWhere({
              _id: subscription.cleaningCoupon,
              isActive: true,
            });

          if (!subscription.nextScheduleDate)
            throw new Error("Next schedule date is not valid");

          const newBooking =
            await this.cleaningSubscriptionService.createBookingFromSubscription(
              subscription,
              subscription.nextScheduleDate,
              cleaningCoupon,
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

          await this.emailService.sendBookingRenewedMail(
            booking.bookingUserInfo.email,
            booking.bookingUserInfo.fullName,
            newBooking.cleaningDate,
            newBooking.cleaningDuration,
          );

          this.logger.log(
            "Booking renewed from subscription with Id: " +
              newBooking._id.toString(),
          );
        } catch (err) {
          this.logger.error("Error renewing booking from schedular: ", err);
        }
      },
    );
  }

  private async notifyUsersForUpcomingBookings() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 4);
    const endDate = new Date(today);
    endDate.setDate(today.getDate() - 3);

    const upcomingSubscriptionBookings =
      await this.cleaningSubscriptionRepository.getAll(
        {
          subscriptionFrequency: {
            $ne: CleaningSubscriptionFrequencyEnum.ONETIME,
          },
          nextScheduleDate: { $gte: startDate, $lt: endDate },
        },
        {
          populate: { path: "subscribedUser" },
        },
      );

    upcomingSubscriptionBookings.forEach(
      async (subscription: CleaningSubscriptionDocument) => {
        try {
          if (!subscription.nextScheduleDate)
            throw new Error(
              "No next schedule date was found for subscription ID: " +
                subscription.id,
            );

          const subscribedUser =
            subscription.subscribedUser as unknown as ApplicationUserDocument;

          await this.emailService.sendUpcomingBookingReminderMail(
            subscribedUser.email,
            subscribedUser.fullName,
            subscription.nextScheduleDate,
          );

          this.logger.log(
            "Booking reminder notification sent to user with email: " +
              subscribedUser.email,
          );
        } catch (error) {
          this.logger.error(
            "Error notifying booking user from schedular: ",
            error,
          );
        }
      },
    );
  }

  //#endregion
}
