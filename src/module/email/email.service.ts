import { MailerService } from "@nestjs-modules/mailer";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class EmailService {
  private readonly logger: Logger = new Logger(EmailService.name);
  private readonly companyName: string = "Sparkling Home";

  constructor(private mailerService: MailerService) {}

  async sendUserSigninMail(userEmail: string, userName: string = "User") {
    try {
      await this.mailerService.sendMail({
        to: userEmail,
        subject: "New signin detected",
        template: "./signin",
        context: {
          companyName: this.companyName,
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
          userName: userName || "",
          userEmail: userEmail || "",
          userPassword: userPassword || "",
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
    resetLink: string,
  ) {
    try {
      await this.mailerService.sendMail({
        to: userEmail,
        subject: "Reset Your Password",
        template: "./reset-password",
        context: {
          companyName: this.companyName,
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
}
