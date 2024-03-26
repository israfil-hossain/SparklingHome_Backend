import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ApplicationUserDocument } from "../application-user/entities/application-user.entity";
import { CleaningBookingRepository } from "../cleaning-booking/cleaning-booking.repository";
import { CleaningBookingDocument } from "../cleaning-booking/entities/cleaning-booking.entity";
import { CleaningCouponRepository } from "../cleaning-coupon/cleaning-coupon.repository";
import { EmailService } from "../email/email.service";
import { CleaningSubscriptionRepository } from "./cleaning-subscription.repository";
import { CleaningSubscriptionService } from "./cleaning-subscription.service";
import { CleaningSubscriptionFrequencyEnum } from "./enum/cleaning-subscription-frequency.enum";

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

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
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
  private async notifyUsersForUpcomingBookings() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(today);
    startDate.setDate(today.getDate() + 4);

    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 5);

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

    for (const subscription of upcomingSubscriptionBookings) {
      try {
        if (!subscription.nextScheduleDate) {
          throw new Error(
            `No next schedule date was found for subscription ID: ${subscription.id}`,
          );
        }

        const subscribedUser =
          subscription.subscribedUser as unknown as ApplicationUserDocument;

        await this.emailService.sendUpcomingBookingReminderMail(
          subscribedUser.email,
          subscribedUser.fullName,
          subscription.nextScheduleDate,
        );

        this.logger.log(
          `Booking reminder notification sent to user with email: ${subscribedUser.email}`,
        );
      } catch (error) {
        this.logger.error(
          "Error notifying booking user from scheduler: ",
          error,
        );
        continue;
      }
    }
  }

  private async renewSubsciptionBookings() {
    const scheduleDate = new Date();
    scheduleDate.setHours(0, 0, 0, 0);
    scheduleDate.setDate(scheduleDate.getDate() + 2);

    const subscriptionsForBookingRenew =
      await this.cleaningSubscriptionRepository.getAllSubscriptionsForBookingRenew(
        scheduleDate,
      );

    for (const subscription of subscriptionsForBookingRenew) {
      try {
        const currentBooking =
          subscription.currentBooking as unknown as CleaningBookingDocument;
        const subscribedUser =
          subscription.subscribedUser as unknown as ApplicationUserDocument;

        if (!currentBooking) {
          throw new Error("No booking found for current subscription");
        }

        if (!subscription.nextScheduleDate)
          throw new Error("Next schedule date is not valid");

        const cleaningCoupon = await this.cleaningCouponRepository.getOneWhere({
          _id: subscription.cleaningCoupon,
          isActive: true,
        });

        const currentDate = new Date();
        let cleaningDate: Date = subscription.nextScheduleDate;
        currentDate.setHours(
          cleaningDate.getHours(),
          cleaningDate.getMinutes(),
          cleaningDate.getSeconds(),
          cleaningDate.getMilliseconds(),
        );

        while (cleaningDate <= currentDate) {
          const newCleaningDate =
            this.cleaningSubscriptionService.getNextScheduleDate(
              cleaningDate,
              subscription.subscriptionFrequency,
            );

          if (!newCleaningDate) break;
          cleaningDate = newCleaningDate;
        }

        const newBooking =
          await this.cleaningSubscriptionService.createBookingFromSubscription(
            subscription,
            cleaningDate,
            cleaningCoupon,
          );

        const nextScheduleDate =
          this.cleaningSubscriptionService.getNextScheduleDate(
            newBooking.cleaningDate,
            subscription.subscriptionFrequency,
          );

        await this.cleaningSubscriptionRepository.updateOneById(
          subscription._id.toString(),
          {
            currentBooking: newBooking.id,
            nextScheduleDate,
            updatedAt: new Date(),
          },
        );

        await this.cleaningBookingRepository.updateOneById(
          currentBooking._id.toString(),
          {
            isActive: false,
            updatedAt: new Date(),
          },
        );

        await this.emailService.sendBookingRenewedMail(
          subscribedUser.email,
          subscribedUser.fullName,
          newBooking.cleaningDate,
          newBooking.cleaningDuration,
        );

        this.logger.log(
          "Booking renewed from subscription with Id: " +
            subscription._id.toString(),
        );
      } catch (err) {
        this.logger.error("Error renewing booking from scheduler: ", err);
        continue;
      }
    }
  }

  //#endregion
}
