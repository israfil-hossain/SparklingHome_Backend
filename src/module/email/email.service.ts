import { MailerService } from "@nestjs-modules/mailer";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DateTimeHelper } from "../../utility/helper/date-time.helper";
import { CleaningSubscriptionFrequencyEnum } from "../cleaning-subscription/enum/cleaning-subscription-frequency.enum";

@Injectable()
export class EmailService {
  private readonly logger: Logger = new Logger(EmailService.name);
  private readonly companyName: string = "Glänsande Hem";
  private readonly staticWebsiteUrl: string;
  private readonly adminEmailAddress: string;

  constructor(
    private mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.staticWebsiteUrl = this.configService.get(
      "WEBSITE_URL",
      "https://app.glansandehem.se",
    );
    this.adminEmailAddress = this.configService.get(
      "ADMIN_EMAIL_ADDRESS",
      "admin@glansandehem.se",
    );
  }

  async sendUserSignupMail(userEmail: string, userName: string = "User") {
    try {
      await this.mailerService.sendMail({
        to: userEmail,
        subject: "Welcome abroad",
        template: "./new-subscription-user",
        context: {
          userName: userName,
          email: userEmail,
        },
      });
      this.logger.log("Email sent successfully to: " + userEmail);
    } catch (error) {
      this.logger.error("Failed to send welcome email: ", error);
    }
  }

  async sendForgetPasswordMail(
    userEmail: string,
    userName: string = "User",
    resetToken: string,
  ) {
    try {
      const resetLink = `${this.staticWebsiteUrl}/reset-password/${resetToken}`;

      await this.mailerService.sendMail({
        to: userEmail,
        subject: "Reset Your Password",
        template: "./reset-password",
        context: {
          companyName: this.companyName,
          companyWebsite: this.staticWebsiteUrl,
          userName: userName || "",
          resetLink: resetLink || "",
        },
      });
      this.logger.log(
        "Forget Password email sent successfully to: " + userEmail,
      );
    } catch (error) {
      this.logger.error("Failed to send Forget Password email: ", error);
    }
  }

  async sendBookingConfirmedMail(
    userEmail: string,
    bookingDateTime: Date,
    bookingDuration: number,
    subscriptionFrequency: CleaningSubscriptionFrequencyEnum,
  ) {
    try {
      const bookingStartDateTime = new Date(bookingDateTime);
      const bookingEndDateTime = new Date(bookingDateTime);
      bookingEndDateTime.setHours(
        bookingStartDateTime.getHours() + bookingDuration,
      );

      await this.mailerService.sendMail({
        to: userEmail,
        subject: "Your Booking has been confirmed.",
        template: "./booking-confirmed",
        context: {
          bookingDate: new DateTimeHelper(bookingStartDateTime).formatDate(),
          bookingStartTime: new DateTimeHelper(
            bookingStartDateTime,
          ).formatTime(),
          bookingEndTime: new DateTimeHelper(bookingEndDateTime).formatTime(),
          bookingFrequency: subscriptionFrequency?.replace(
            /([a-z])([A-Z])/g,
            "$1 $2",
          ),
        },
      });
      this.logger.log(
        "Booking confirmed email sent successfully to: " + userEmail,
      );
    } catch (error) {
      this.logger.error("Failed to send booking confirmed email: ", error);
    }
  }

  async sendBookingServedMail(userEmail: string) {
    try {
      await this.mailerService.sendMail({
        to: userEmail,
        subject: "Completion of Cleaning Service and Payment Reminder",
        template: "./booking-served",
        context: {
          websiteUrl: this.staticWebsiteUrl,
        },
      });
      this.logger.log(
        "Booking served email sent successfully to: " + userEmail,
      );
    } catch (error) {
      this.logger.error("Failed to send booking served email: ", error);
    }
  }

  async sendBookingRenewedMail(
    userEmail: string,
    userName: string = "User",
    upcomingDate: Date,
    bookingDuration: number,
    subscriptionFrequency: CleaningSubscriptionFrequencyEnum,
  ) {
    try {
      const bookingStartDateTime = new Date(upcomingDate);
      const bookingEndDateTime = new Date(upcomingDate);
      bookingEndDateTime.setHours(
        bookingStartDateTime.getHours() + bookingDuration,
      );

      await this.mailerService.sendMail({
        to: userEmail,
        subject: "Important Notice: Your Upcoming Cleaning Booking",
        template: "./booking-renew",
        context: {
          userName: userName,
          cancelLink: `${this.staticWebsiteUrl}/profile`,
          bookingDate: new DateTimeHelper(bookingStartDateTime).formatDate(),
          bookingStartTime: new DateTimeHelper(
            bookingStartDateTime,
          ).formatTime(),
          bookingEndTime: new DateTimeHelper(bookingEndDateTime).formatTime(),
          subscriptionFrequency: subscriptionFrequency?.replace(
            /([a-z])([A-Z])/g,
            "$1 $2",
          ),
        },
      });
      this.logger.log(
        "Booking renewed email sent successfully to: " + userEmail,
      );
    } catch (error) {
      this.logger.error("Failed to send booking renewed email: ", error);
    }
  }

  async sendUpcomingBookingReminderMail(
    userEmail: string,
    userName: string = "User",
    upcomingDate: Date,
    bookingDuration: number,
    subscriptionFrequency: CleaningSubscriptionFrequencyEnum,
  ) {
    try {
      const bookingStartDateTime = new Date(upcomingDate);
      const bookingEndDateTime = new Date(upcomingDate);
      bookingEndDateTime.setHours(
        bookingStartDateTime.getHours() + bookingDuration,
      );

      await this.mailerService.sendMail({
        to: userEmail,
        subject:
          "Soft reminder! Upcoming cleaning services have been initially confirmed",
        template: "./upcoming-booking",
        context: {
          userName: userName,
          cancelLink: `${this.staticWebsiteUrl}/profile`,
          bookingDate: new DateTimeHelper(bookingStartDateTime).formatDate(),
          bookingStartTime: new DateTimeHelper(
            bookingStartDateTime,
          ).formatTime(),
          bookingEndTime: new DateTimeHelper(bookingEndDateTime).formatTime(),
          subscriptionFrequency: subscriptionFrequency?.replace(
            /([a-z])([A-Z])/g,
            "$1 $2",
          ),
        },
      });
      this.logger.log(
        "Booking renewed email sent successfully to: " + userEmail,
      );
    } catch (error) {
      this.logger.error("Failed to send booking renewed email: ", error);
    }
  }

  async sendPaymentReceivedMail(
    userEmail: string,
    userName: string = "User",
    cleaningDate: Date,
    bookingDuration: number,
    paymentDate: Date,
    paymentAmount: number,
  ) {
    try {
      const bookingStartDateTime = new Date(cleaningDate);
      const bookingEndDateTime = new Date(cleaningDate);
      bookingEndDateTime.setHours(
        bookingStartDateTime.getHours() + bookingDuration,
      );
      await this.mailerService.sendMail({
        to: userEmail,
        subject: "Payment Received",
        template: "./payment-received",
        context: {
          companyName: this.companyName,
          companyWebsite: this.staticWebsiteUrl,
          userName: userName,
          paymentAmount: paymentAmount,
          paymentDate: new DateTimeHelper(paymentDate).formatDateTime(),
          bookingDate: new DateTimeHelper(bookingStartDateTime).formatDate(),
          bookingStartTime: new DateTimeHelper(
            bookingStartDateTime,
          ).formatTime(),
          bookingEndTime: new DateTimeHelper(bookingEndDateTime).formatTime(),
        },
      });
      this.logger.log(
        `Payment received email sent successfully to: ${userEmail}`,
      );
    } catch (error) {
      this.logger.error("Failed to send payment received email: ", error);
    }
  }

  async sendNewSubscriptionMail(
    userEmail: string,
    userName: string = "User",
    userPassword?: string,
  ) {
    try {
      await this.mailerService.sendMail({
        to: userEmail,
        subject: "Your booking request has been received.",
        template: "./new-subscription-user",
        context: {
          userName: userName,
          email: userEmail,
          password: userPassword,
        },
      });
      this.logger.log(
        `New cleaning subscription confirmation email sent successfully to: ${userEmail}`,
      );
    } catch (error) {
      this.logger.error(
        "Failed to send new cleaning subscription confirmation email: ",
        error,
      );
    }
  }

  async sendNewSubscriptionMailToAdmin(
    cleaningDate: Date,
    bookingDuration: number,
    userName: string = "User",
    userPhone: string = "N/A",
    userAddress: string = "N/A",
  ) {
    try {
      const bookingStartDateTime = new Date(cleaningDate);
      const bookingEndDateTime = new Date(cleaningDate);
      bookingEndDateTime.setHours(
        bookingStartDateTime.getHours() + bookingDuration,
      );

      await this.mailerService.sendMail({
        to: this.adminEmailAddress,
        subject: `You have a new booking request from ${userName || "New User"}`,
        template: "./new-subscription-admin",
        context: {
          userName: userName,
          userAddress: userAddress,
          userPhone: userPhone,
          bookingDate: new DateTimeHelper(bookingStartDateTime).formatDate(),
          bookingStartTime: new DateTimeHelper(
            bookingStartDateTime,
          ).formatTime(),
          bookingEndTime: new DateTimeHelper(bookingEndDateTime).formatTime(),
        },
      });
      this.logger.log(
        "New subscription notification sent to admin successfully.",
      );
    } catch (error) {
      this.logger.error(
        "Failed to send new subscription notification to admin: ",
        error,
      );
    }
  }

  async sendRescheduleOfNextBookingNotification(
    userEmail: string,
    userName: string,
    rescheduledCleaningDate: Date,
    bookingDuration: number,
  ) {
    try {
      const bookingStartDateTime = new Date(rescheduledCleaningDate);
      const bookingEndDateTime = new Date(rescheduledCleaningDate);
      bookingEndDateTime.setHours(
        bookingStartDateTime.getHours() + bookingDuration,
      );

      await this.mailerService.sendMail({
        to: userEmail,
        subject: "Cleaning Schedule Update",
        template: "./reschedule-next-booking",
        context: {
          companyName: this.companyName,
          companyWebsite: this.staticWebsiteUrl,
          userName: userName,
          bookingDate: new DateTimeHelper(bookingStartDateTime).formatDate(),
          bookingStartTime: new DateTimeHelper(
            bookingStartDateTime,
          ).formatTime(),
          bookingEndTime: new DateTimeHelper(bookingEndDateTime).formatTime(),
        },
      });
      this.logger.log(
        `Reschedule notification email sent successfully to: ${userEmail}`,
      );
    } catch (error) {
      this.logger.error(
        "Failed to send reschedule notification email: ",
        error,
      );
    }
  }
}
