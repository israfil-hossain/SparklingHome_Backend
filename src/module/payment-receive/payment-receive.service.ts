import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance } from "axios";
import { UpdateQuery } from "mongoose";
import { DateTimeHelper } from "../../utility/helper/date-time.helper";
import { ApplicationUserDocument } from "../application-user/entities/application-user.entity";
import { CleaningBookingRepository } from "../cleaning-booking/cleaning-booking.repository";
import { CleaningBookingDocument } from "../cleaning-booking/entities/cleaning-booking.entity";
import { CleaningBookingPaymentStatusEnum } from "../cleaning-booking/enum/cleaning-booking-payment-status.enum";
import { CleaningBookingStatusEnum } from "../cleaning-booking/enum/cleaning-booking-status.enum";
import { SuccessResponseDto } from "../common/dto/success-response.dto";
import { EmailService } from "../email/email.service";
import { PaymentIntentResponseDto } from "./dto/payment-intent-response.dto";
import { PaymentReceiveDocument } from "./entities/payment-receive.entity";
import { PaymentWebhookEventEnum } from "./enum/payment-webhook-event.enum";
import { IPaymentIntentRetrieveDto } from "./interface/payment-intent-retrieve.interface";
import {
  IPaymentWebhookEvent,
  IPaymentWebhookEventData,
} from "./interface/payment-webhook-event.interface";
import { PaymentEventRepository } from "./payment-event.repository";
import { PaymentReceiveRepository } from "./payment-receive.repository";

@Injectable()
export class PaymentReceiveService {
  private readonly logger: Logger = new Logger(PaymentReceiveService.name);
  private readonly webhookEndpoint: string = "/api/PaymentReceive/WebhookEvent";

  private readonly paymentApiClient: AxiosInstance;
  private readonly webhookSecret: string;
  private readonly staticServerUrl: string;
  private readonly staticWebsiteUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly paymentReceiveRepository: PaymentReceiveRepository,
    private readonly paymentEventRepository: PaymentEventRepository,
    private readonly cleaningBookingRepository: CleaningBookingRepository,
    private readonly emailService: EmailService,
  ) {
    this.staticServerUrl = this.configService.get(
      "SERVER_URL",
      "https://api.app.glansandehem.se",
    );
    this.staticWebsiteUrl = this.configService.get(
      "WEBSITE_URL",
      "https://app.glansandehem.se",
    );
    this.webhookSecret = this.configService.get(
      "NEXI_WEBHOOK_SECRET",
      "BZVhSEsOi1g5sqrorAWKZULxkZ2d2NBQ",
    );
    this.paymentApiClient = axios.create({
      baseURL: this.configService.get("NEXI_PAYMENT_URL", ""),
      headers: {
        Authorization: this.configService.get("NEXI_SECRET_KEY", ""),
      },
    });
  }

  async getPaymentIntent(
    bookingId: string,
    auditUserId: string,
  ): Promise<SuccessResponseDto> {
    try {
      const booking = await this.getBookingWithPayment(bookingId);

      let paymentReceive =
        booking.paymentReceive as unknown as PaymentReceiveDocument;

      if (
        !paymentReceive ||
        booking.totalAmount !== paymentReceive.totalPayable
      ) {
        paymentReceive = await this.createPaymentReceive(booking, auditUserId);
      }

      const paymentIntentResponse = new PaymentIntentResponseDto();
      paymentIntentResponse.bookingCode = booking.id;
      paymentIntentResponse.bookingPrice = paymentReceive.totalPayable;
      paymentIntentResponse.redirectUrl = paymentReceive.paymentRedirectUrl;

      return new SuccessResponseDto(
        "Payment intent retrieved successfully",
        paymentIntentResponse,
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if (error?.response?.data) {
        this.logger.error(
          "Error in getPaymentIntent HTTP Response:",
          error?.response?.data,
        );
      }

      this.logger.error("Error in getPaymentIntent:", error);
      throw new BadRequestException("Failed to get payment intent");
    }
  }

  async getPaymentUpdate(bookingId: string): Promise<SuccessResponseDto> {
    try {
      const booking = await this.cleaningBookingRepository.getOneWhere(
        {
          _id: bookingId,
          isActive: true,
          bookingStatus: CleaningBookingStatusEnum.BookingServed,
          paymentStatus: {
            $ne: CleaningBookingPaymentStatusEnum.PaymentCompleted,
          },
        },
        {
          populate: ["paymentReceive", "bookingUser"],
        },
      );

      if (!booking || !booking.paymentReceive) {
        throw new NotFoundException("Booking not found or already completed");
      }

      const paymentReceive =
        booking.paymentReceive as unknown as PaymentReceiveDocument;

      const paymentIntentResponse =
        await this.paymentApiClient.get<IPaymentIntentRetrieveDto>(
          `/v1/payments/${paymentReceive.paymentIntentId}`,
        );

      if (paymentIntentResponse.status !== 200) {
        throw new BadRequestException("Payment intent not found.");
      }

      const summary = paymentIntentResponse.data.payment.summary;
      if (!summary || !summary.chargedAmount) {
        throw new BadRequestException("Payment not completed yet.");
      }

      const paymentReceiveUpdate: UpdateQuery<PaymentReceiveDocument> = {
        lastPaymentEvent: JSON.stringify(paymentIntentResponse),
        paymentDate: new Date(),
      };

      const totalPaid = summary.chargedAmount / 100;
      const totalDue = paymentReceive.totalDue - totalPaid;

      paymentReceiveUpdate.totalDue = totalDue.toFixed(2);
      paymentReceiveUpdate.totalPaid = totalPaid.toFixed(2);

      await this.paymentReceiveRepository.updateOneById(
        paymentReceive.id,
        paymentReceiveUpdate,
      );

      await this.cleaningBookingRepository.updateOneById(booking.id, {
        bookingStatus: CleaningBookingStatusEnum.BookingCompleted,
        paymentStatus: CleaningBookingPaymentStatusEnum.PaymentCompleted,
      });

      const bookingUser =
        booking.bookingUser as unknown as ApplicationUserDocument;

      if (bookingUser) {
        this.emailService.sendPaymentReceivedMail(
          bookingUser.email,
          bookingUser.fullName,
          booking.cleaningDate,
          booking.cleaningDuration,
          paymentReceiveUpdate.paymentDate,
          paymentReceiveUpdate.totalPaid,
        );
      }

      return new SuccessResponseDto("Booking payment updated successfully");
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if (error?.response?.data) {
        this.logger.error(
          "Error in getPaymentIntent HTTP Response:",
          error?.response?.data,
        );
      }

      this.logger.error("Error in getPaymentIntent:", error);
      throw new BadRequestException("Failed to get payment intent");
    }
  }

  async handleWebhookEvent(
    signature: string,
    event: IPaymentWebhookEvent,
  ): Promise<void> {
    try {
      if (!signature || signature !== this.webhookSecret)
        throw new BadRequestException("Unauthorized access");

      if (!event) throw new BadRequestException("Invalid webhook payload");
      this.storePaymentEventLog(JSON.stringify(event));

      const { event: eventType, data } = event;
      switch (eventType) {
        case PaymentWebhookEventEnum.PaymentReservationFailed:
          await this.updateBookingAndPaymentStatus(
            data,
            CleaningBookingPaymentStatusEnum.PaymentFailed,
          );
          break;
        case PaymentWebhookEventEnum.PaymentChargeFailed:
          await this.updateBookingAndPaymentStatus(
            data,
            CleaningBookingPaymentStatusEnum.PaymentFailed,
          );
          break;
        case PaymentWebhookEventEnum.PaymentCheckoutCompleted:
          await this.updateBookingAndPaymentStatus(
            data,
            CleaningBookingPaymentStatusEnum.PaymentCompleted,
          );
          break;
        default:
          throw new Error("Invalid webhook event type");
      }
    } catch (error) {
      this.logger.error("Error in handleWebhookEvent:", error);
      throw new BadRequestException("Failed to handle webhook event");
    }
  }

  //#region Internal private methods
  private async getBookingWithPayment(
    bookingId: string,
  ): Promise<CleaningBookingDocument> {
    const booking = await this.cleaningBookingRepository.getOneWhere(
      {
        _id: bookingId,
        isActive: true,
        bookingStatus: { $eq: CleaningBookingStatusEnum.BookingServed },
        paymentStatus: {
          $nin: [
            CleaningBookingPaymentStatusEnum.PaymentCompleted,
            CleaningBookingPaymentStatusEnum.PaymentFailed,
          ],
        },
      },
      {
        populate: "paymentReceive",
      },
    );
    if (!booking) {
      this.logger.error(
        `Booking with ID ${bookingId} was not found or not eligible for payment.`,
        bookingId,
      );
      throw new NotFoundException(
        `Booking with ID ${bookingId} not found or not eligible for payment.`,
      );
    }

    return booking;
  }

  private async createPaymentIntent(
    booking: CleaningBookingDocument,
  ): Promise<{ paymentId: string; hostedPaymentPageUrl: string }> {
    try {
      const { data } = await this.paymentApiClient.post<{
        paymentId: string;
        hostedPaymentPageUrl: string;
      }>("/v1/payments", {
        order: {
          items: [
            {
              reference: booking.id,
              name: `Reservation for cleaning on ${new DateTimeHelper(booking.cleaningDate).formatDateTime()}`,
              quantity: 1,
              unit: "Reservation",
              unitPrice: booking.totalAmount * 100,
              netTotalAmount: booking.totalAmount * 100,
              grossTotalAmount: booking.totalAmount * 100,
            },
          ],
          amount: booking.totalAmount * 100,
          currency: "SEK",
          reference: booking.id,
        },
        checkout: {
          integrationType: "HostedPaymentPage",
          returnUrl: `${this.staticWebsiteUrl}/profile`,
          termsUrl: `${this.staticWebsiteUrl}/terms-and-conditions`,
          charge: true,
          publicDevice: true,
          merchantHandlesConsumerData: true,
          appearance: {
            displayOptions: { showMerchantName: true, showOrderSummary: true },
            textOptions: { completePaymentButtonText: "pay" },
          },
        },
        notifications: {
          webHooks: Object.values(PaymentWebhookEventEnum).map((value) => ({
            eventName: value,
            url: `${this.staticServerUrl}${this.webhookEndpoint}`,
            authorization: this.webhookSecret,
          })),
        },
      });

      return data;
    } catch (error) {
      if (error?.response?.data) {
        this.logger.error(
          "Error in createPaymentIntent HTTP Response:",
          error?.response?.data,
        );
      }

      this.logger.error("Error in createPaymentIntent:", error);
      throw error;
    }
  }

  private async createPaymentReceive(
    booking: CleaningBookingDocument,
    auditUserId: string,
  ): Promise<PaymentReceiveDocument> {
    const paymentIntentCreateResponse = await this.createPaymentIntent(booking);
    const paymentReceive = await this.paymentReceiveRepository.create({
      totalPayable: booking.totalAmount,
      totalDue: booking.totalAmount,
      paymentIntentId: paymentIntentCreateResponse.paymentId,
      paymentRedirectUrl: paymentIntentCreateResponse.hostedPaymentPageUrl,
      createdBy: auditUserId,
    });

    this.cleaningBookingRepository.updateOneById(booking.id, {
      paymentReceive: paymentReceive.id,
      paymentStatus: CleaningBookingPaymentStatusEnum.PaymentCreated,
      updatedBy: auditUserId,
    });

    return paymentReceive;
  }

  // Webhook handler heplers
  private async updateBookingAndPaymentStatus(
    data: IPaymentWebhookEventData,
    paymentStatus: CleaningBookingPaymentStatusEnum,
  ): Promise<void> {
    const paymentReceive = await this.paymentReceiveRepository.getOneWhere({
      paymentIntentId: data.paymentId,
    });

    if (!paymentReceive) {
      this.logger.error("Invalid payment receive", data);
      throw new BadRequestException("Invalid payment receive");
    }

    const booking = await this.cleaningBookingRepository.getOneWhere(
      {
        isActive: true,
        paymentReceive: paymentReceive.id,
      },
      {
        populate: "bookingUser",
      },
    );

    if (!booking) {
      this.logger.error("Invalid booking for payment receive", paymentReceive);
      throw new BadRequestException("Invalid booking for payment receive");
    }

    const paymentReceiveUpdate: UpdateQuery<PaymentReceiveDocument> = {
      lastPaymentEvent: JSON.stringify(data),
      paymentDate: new Date(),
    };

    if (paymentStatus === CleaningBookingPaymentStatusEnum.PaymentCompleted) {
      const payableAmount = data?.order?.amount?.amount;
      if (!payableAmount) return;

      const totalPaid = payableAmount / 100;
      const totalDue = paymentReceive.totalDue - totalPaid;

      paymentReceiveUpdate.totalDue = totalDue.toFixed(2);
      paymentReceiveUpdate.totalPaid = totalPaid.toFixed(2);
    }

    await this.paymentReceiveRepository.updateOneById(
      paymentReceive.id,
      paymentReceiveUpdate,
    );

    await this.cleaningBookingRepository.updateOneById(booking.id, {
      bookingStatus: CleaningBookingStatusEnum.BookingCompleted,
      paymentStatus,
    });

    const bookingUser =
      booking.bookingUser as unknown as ApplicationUserDocument;
    this.emailService.sendPaymentReceivedMail(
      bookingUser.email,
      bookingUser.fullName,
      booking.cleaningDate,
      booking.cleaningDuration,
      paymentReceiveUpdate.paymentDate,
      paymentReceiveUpdate.totalPaid,
    );
  }

  private async storePaymentEventLog(event: string): Promise<void> {
    try {
      await this.paymentEventRepository.create({
        eventData: event,
      });
    } catch (err) {
      this.logger.error("Failed to store payment event log: " + err);
    }
  }
  //#endregion
}
