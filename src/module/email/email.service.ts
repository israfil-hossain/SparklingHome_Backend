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
      this.logger.verbose("Signup email sent successfully to: " + userEmail);
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
      this.logger.verbose(
        "Forget Password email sent successfully to: " + userEmail,
      );
    } catch (error) {
      this.logger.error("Failed to send Forget Password email: ", error);
    }
  }

  async sendBookingConfirmedMail(
    userEmail: string,
    bookingDate: Date,
    bookingDuration: number,
    subscriptionFrequency: CleaningSubscriptionFrequencyEnum,
  ) {
    try {
      const bookingDateTime = new DateTimeHelper(bookingDate);

      await this.mailerService.sendMail({
        to: userEmail,
        subject: "Your Booking has been confirmed.",
        template: "./booking-confirmed",
        context: {
          bookingDate: bookingDateTime.formatDate(),
          bookingStartTime: bookingDateTime.formatTime(),
          bookingEndTime: bookingDateTime.formatEndTime(bookingDuration),
          bookingFrequency: subscriptionFrequency?.replace(
            /([a-z])([A-Z])/g,
            "$1 $2",
          ),
        },
      });
      this.logger.verbose(
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
      this.logger.verbose(
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
      const bookingDateTime = new DateTimeHelper(upcomingDate);

      await this.mailerService.sendMail({
        to: userEmail,
        subject: "Important Notice: Your Upcoming Cleaning Booking",
        template: "./booking-renew",
        context: {
          userName: userName,
          cancelLink: `${this.staticWebsiteUrl}/profile`,
          bookingDate: bookingDateTime.formatDate(),
          bookingStartTime: bookingDateTime.formatTime(),
          bookingEndTime: bookingDateTime.formatEndTime(bookingDuration),
          subscriptionFrequency: subscriptionFrequency?.replace(
            /([a-z])([A-Z])/g,
            "$1 $2",
          ),
        },
      });
      this.logger.verbose(
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
      const bookingDateTime = new DateTimeHelper(upcomingDate);

      await this.mailerService.sendMail({
        to: userEmail,
        subject:
          "Soft reminder! Upcoming cleaning services have been initially confirmed",
        template: "./upcoming-booking",
        context: {
          userName: userName,
          cancelLink: `${this.staticWebsiteUrl}/profile`,
          bookingDate: bookingDateTime.formatDate(),
          bookingStartTime: bookingDateTime.formatTime(),
          bookingEndTime: bookingDateTime.formatEndTime(bookingDuration),
          subscriptionFrequency: subscriptionFrequency?.replace(
            /([a-z])([A-Z])/g,
            "$1 $2",
          ),
        },
      });
      this.logger.verbose(
        "Booking renew reminder email sent successfully to: " + userEmail,
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
      const paymentDateTime = new DateTimeHelper(paymentDate);
      const bookingDateTime = new DateTimeHelper(cleaningDate);

      await this.mailerService.sendMail({
        to: userEmail,
        subject: "Payment Received",
        template: "./payment-received",
        context: {
          companyName: this.companyName,
          companyWebsite: this.staticWebsiteUrl,
          userName: userName,
          paymentAmount: paymentAmount,
          paymentDate: paymentDateTime.formatDateTime(),
          bookingDate: bookingDateTime.formatDate(),
          bookingStartTime: bookingDateTime.formatTime(),
          bookingEndTime: bookingDateTime.formatEndTime(bookingDuration),
        },
      });
      this.logger.verbose(
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
      this.logger.verbose(
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
      const bookingDateTime = new DateTimeHelper(cleaningDate);

      await this.mailerService.sendMail({
        to: this.adminEmailAddress,
        subject: `You have a new booking request from ${userName || "New User"}`,
        template: "./new-subscription-admin",
        context: {
          userName: userName,
          userAddress: userAddress,
          userPhone: userPhone,
          bookingDate: bookingDateTime.formatDate(),
          bookingStartTime: bookingDateTime.formatTime(),
          bookingEndTime: bookingDateTime.formatEndTime(bookingDuration),
        },
      });

      this.logger.verbose(
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
    subscriptionFrequency: CleaningSubscriptionFrequencyEnum,
  ) {
    try {
      const bookingDateTime = new DateTimeHelper(rescheduledCleaningDate);

      await this.mailerService.sendMail({
        to: userEmail,
        subject: "Cleaning Schedule Update",
        template: "./reschedule-next-booking",
        context: {
          companyName: this.companyName,
          companyWebsite: this.staticWebsiteUrl,
          cancelLink: `${this.staticWebsiteUrl}/profile`,
          userName: userName,
          subscriptionFrequency: subscriptionFrequency?.replace(
            /([a-z])([A-Z])/g,
            "$1 $2",
          ),
          bookingDate: bookingDateTime.formatDate(),
          bookingStartTime: bookingDateTime.formatTime(),
          bookingEndTime: bookingDateTime.formatEndTime(bookingDuration),
        },
      });

      this.logger.verbose(
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
