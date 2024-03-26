import { MailerService } from "@nestjs-modules/mailer";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CleaningBookingDocument } from "../cleaning-booking/entities/cleaning-booking.entity";

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

  async sendUserSigninMail(userEmail: string, userName: string = "User") {
    try {
      await this.mailerService.sendMail({
        to: userEmail,
        subject: "New signin detected",
        template: "./signin",
        context: {
          companyName: this.companyName,
          companyWebsite: this.staticWebsiteUrl,
          userName: userName || "",
          userEmail: userEmail || "",
        },
      });
      this.logger.log("Email sent successfully to: " + userEmail);
    } catch (error) {
      this.logger.error("Failed to send email: " + error);
    }
  }

  async sendUserSignupMail(userEmail: string, userName: string = "User") {
    try {
      await this.mailerService.sendMail({
        to: userEmail,
        subject: "Welcome abroad",
        template: "./signup",
        context: {
          companyName: this.companyName,
          companyWebsite: this.staticWebsiteUrl,
          userName: userName || "",
          userEmail: userEmail || "",
        },
      });
      this.logger.log("Email sent successfully to: " + userEmail);
    } catch (error) {
      this.logger.error("Failed to send email: " + error);
    }
  }

  async sendUserCredentialsMail(
    userEmail: string,
    userName: string = "User",
    userPassword: string,
  ) {
    try {
      await this.mailerService.sendMail({
        to: userEmail,
        subject: "Welcome abroad",
        template: "./signup",
        context: {
          companyName: this.companyName,
          companyWebsite: this.staticWebsiteUrl,
          userName: userName || "",
          userEmail: userEmail || "",
          userPassword: userPassword || "",
        },
      });
      this.logger.log("Email sent successfully to: " + userEmail);
    } catch (error) {
      this.logger.error("Failed to send email: " + error);
      // Temporarily log in case of mail error
      this.logger.error(
        `New user created from subscription with these credentials: `,
        {
          userName,
          userEmail,
          userPassword,
        },
      );
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
    userName: string = "User",
    cleaningDate: Date,
  ) {
    try {
      await this.mailerService.sendMail({
        to: userEmail,
        subject: "Upcoming Booking Notification",
        template: "./upcoming-booking",
        context: {
          companyName: this.companyName,
          companyWebsite: this.staticWebsiteUrl,
          userName: userName,
          cleaningDate: new Date(cleaningDate).toDateString(),
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
    userName: string,
    subscriptionPlan: string,
    cleaningDate: Date,
  ) {
    try {
      await this.mailerService.sendMail({
        to: userEmail,
        subject: "New Cleaning Subscription Confirmation",
        template: "./new-subscription-user",
        context: {
          companyName: this.companyName,
          companyWebsite: this.staticWebsiteUrl,
          userName: userName,
          subscriptionPlan: subscriptionPlan,
          cleaningDate: new Date(cleaningDate).toDateString(),
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
    userEmail: string,
    userName: string,
    subscriptionId: string,
    subscriptionPlan: string,
    cleaningDate: Date,
  ) {
    try {
      await this.mailerService.sendMail({
        to: this.adminEmailAddress,
        subject: "New Subscription Notification",
        template: "./new-subscription-admin",
        context: {
          userName: userName,
          userEmail: userEmail,
          subscriptionId: subscriptionId,
          subscriptionPlan: subscriptionPlan,
          subscriptionDate: new Date().toDateString(),
          startDate: new Date(cleaningDate).toDateString(),
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
