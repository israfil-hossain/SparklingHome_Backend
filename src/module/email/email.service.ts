import { MailerService } from "@nestjs-modules/mailer";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CleaningBookingDocument } from "../cleaning-booking/entities/cleaning-booking.entity";
import { CleaningSubscriptionFrequencyEnum } from "../cleaning-subscription/enum/cleaning-subscription-frequency.enum";

@Injectable()
export class EmailService {
  private readonly logger: Logger = new Logger(EmailService.name);
  private readonly companyName: string = "Glansandehem";
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
      this.logger.error("Failed to send email: " + error);
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
      this.logger.error("Failed to send Forget Password email: " + error);
    }
  }

  async sendBookingConfirmedMail(
    userEmail: string,
    bookingDateTime: Date,
    subscriptionFrequency: CleaningSubscriptionFrequencyEnum,
  ) {
    try {
      const bookingDate = new Date(bookingDateTime);
      await this.mailerService.sendMail({
        to: userEmail,
        subject: "Your Booking has been confirmed.",
        template: "./booking-confirmed",
        context: {
          bookingDateTime:
            bookingDate.toDateString() + " " + bookingDate.toTimeString(),
          bookingFrequency: subscriptionFrequency,
        },
      });
      this.logger.log(
        "Booking served email sent successfully to: " + userEmail,
      );
    } catch (error) {
      this.logger.error("Failed to send booking served email: " + error);
    }
  }

  async sendBookingServedMail(
    userEmail: string,
    userName: string = "User",
    booking: CleaningBookingDocument,
  ) {
    try {
      await this.mailerService.sendMail({
        to: userEmail,
        subject: "Payment Required for Your Cleaning Service",
        template: "./booking-served",
        context: {
          companyName: this.companyName,
          companyWebsite: this.staticWebsiteUrl,
          userName: userName || "",
          cleaningDate: new Date(booking.cleaningDate).toDateString(),
          cleaningDuration: booking.cleaningDuration,
          cleaningPrice: booking.cleaningPrice,
          suppliesCharges: booking.suppliesCharges,
          discountAmount: booking.discountAmount,
          vatAmount: booking.vatAmount,
          additionalCharges: booking.additionalCharges,
          totalAmount: booking.totalAmount,
          remarks: booking.remarks || "",
        },
      });
      this.logger.log(
        "Booking served email sent successfully to: " + userEmail,
      );
    } catch (error) {
      this.logger.error("Failed to send booking served email: " + error);
    }
  }

  async sendBookingRenewedMail(
    userEmail: string,
    userName: string = "User",
    cleaningDate: Date,
    cleaningDuration: number,
  ) {
    try {
      await this.mailerService.sendMail({
        to: userEmail,
        subject: "Upcoming Booking Notification",
        template: "./booking-renew",
        context: {
          companyName: this.companyName,
          companyWebsite: this.staticWebsiteUrl,
          userName: userName,
          cleaningDate: new Date(cleaningDate).toDateString(),
          cleaningDuration: cleaningDuration,
        },
      });
      this.logger.log(
        "Booking renewed email sent successfully to: " + userEmail,
      );
    } catch (error) {
      this.logger.error("Failed to send booking renewed email: " + error);
    }
  }

  async sendUpcomingBookingReminderMail(
    userEmail: string,
    rescheduledCleaningDate: Date,
    subscriptionFrequency: CleaningSubscriptionFrequencyEnum,
  ) {
    try {
      const cleaningDate = new Date(rescheduledCleaningDate);
      await this.mailerService.sendMail({
        to: userEmail,
        subject:
          "Soft reminder! Upcoming cleaning services have been initially confirmed",
        template: "./reschedule-notification",
        context: {
          subscriptionFrequency: subscriptionFrequency,
          bookingDate: cleaningDate.toDateString(),
          bookingTime: cleaningDate.toTimeString(),
          cancelLink: `${this.staticWebsiteUrl}/profile`,
        },
      });
      this.logger.log(
        "Booking renewed email sent successfully to: " + userEmail,
      );
    } catch (error) {
      this.logger.error("Failed to send booking renewed email: " + error);
    }
  }

  async sendPaymentReceivedMail(
    userEmail: string,
    userName: string = "User",
    cleaningDate: Date,
    paymentAmount: number,
  ) {
    try {
      await this.mailerService.sendMail({
        to: userEmail,
        subject: "Payment Received",
        template: "./payment-received",
        context: {
          companyName: this.companyName,
          companyWebsite: this.staticWebsiteUrl,
          userName: userName,
          paymentAmount: paymentAmount.toFixed(2),
          paymentDate: new Date().toDateString(),
          cleaningDate: new Date(cleaningDate).toDateString(),
        },
      });
      this.logger.log(
        `Payment received email sent successfully to: ${userEmail}`,
      );
    } catch (error) {
      this.logger.error("Failed to send payment received email: " + error);
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
        "Failed to send new cleaning subscription confirmation email: " + error,
      );
    }
  }

  async sendNewSubscriptionMailToAdmin(
    cleaningDate: Date,
    userName: string = "User",
    userPhone: string = "N/A",
    userAddress: string = "N/A",
  ) {
    try {
      await this.mailerService.sendMail({
        to: this.adminEmailAddress,
        subject: `You have a new booking request from ${userName || "New User"}`,
        template: "./new-subscription-admin",
        context: {
          userName: userName,
          userAddress: userAddress,
          userPhone: userPhone,
          bookingDate: new Date(cleaningDate).toDateString(),
          bookingTime: new Date(cleaningDate).toTimeString(),
        },
      });
      this.logger.log(
        "New subscription notification sent to admin successfully.",
      );
    } catch (error) {
      this.logger.error(
        "Failed to send new subscription notification to admin: " + error,
      );
    }
  }

  async sendRescheduleNotification(
    userEmail: string,
    userName: string,
    rescheduledCleaningDate: Date,
  ) {
    try {
      await this.mailerService.sendMail({
        to: userEmail,
        subject: "Cleaning Schedule Update",
        template: "./reschedule-notification",
        context: {
          companyName: this.companyName,
          companyWebsite: this.staticWebsiteUrl,
          userName: userName,
          nextCleaningDate: new Date(rescheduledCleaningDate).toDateString(),
        },
      });
      this.logger.log(
        `Reschedule notification email sent successfully to: ${userEmail}`,
      );
    } catch (error) {
      this.logger.error(
        "Failed to send reschedule notification email: " + error,
      );
    }
  }
}
