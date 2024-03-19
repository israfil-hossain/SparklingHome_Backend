import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance } from "axios";
import type { Request } from "express";
import { UpdateQuery } from "mongoose";
import { CleaningBookingRepository } from "../cleaning-booking/cleaning-booking.repository";
import { CleaningBookingDocument } from "../cleaning-booking/entities/cleaning-booking.entity";
import { CleaningBookingPaymentStatusEnum } from "../cleaning-booking/enum/cleaning-booking-payment-status.enum";
import { CleaningBookingStatusEnum } from "../cleaning-booking/enum/cleaning-booking-status.enum";
import { SuccessResponseDto } from "../common/dto/success-response.dto";
import { EncryptionService } from "../encryption/encryption.service";
import { PaymentIntentResponseDto } from "./dto/payment-intent-response.dto";
import { PaymentReceiveDocument } from "./entities/payment-receive.entity";
import { PaymentWebhookEventEnum } from "./enum/payment-webhook-event.enum";
import { ICallbackUrls } from "./interface/callback-urls.interface";
import { IPaymentIntentCreateDto } from "./interface/payment-intent-create.interface";
import {
  IPaymentWebhookEvent,
  IPaymentWebhookEventData,
} from "./interface/payment-webhook-event.interface";
import { PaymentReceiveRepository } from "./payment-receive.repository";

@Injectable()
export class PaymentReceiveService {
  private readonly logger: Logger = new Logger(PaymentReceiveService.name);
  private readonly paymentApiClient: AxiosInstance;
  private readonly webhookSecret: string;
  private readonly staticServerUrl: string;
  private readonly staticWebsiteUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly encryptionService: EncryptionService,
    private readonly paymentReceiveRepository: PaymentReceiveRepository,
    private readonly cleaningBookingRepository: CleaningBookingRepository,
  ) {
    this.staticServerUrl = this.configService.get(
      "SERVER_URL",
      "https://sparkling-home-api.vercel.app",
    );
    this.staticWebsiteUrl = this.configService.get(
      "WEBSITE_URL",
      "https://glansandehem.vercel.app",
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
    hostUrl: string,
    webhookEndpoint: string,
    originUrl: string,
  ): Promise<SuccessResponseDto> {
    try {
      const booking = await this.getBookingWithPayment(bookingId);

      let paymentReceive =
        booking.paymentReceive as unknown as PaymentReceiveDocument;

      if (!paymentReceive) {
        const callbackUrls = this.getCallbackUrls(
          hostUrl,
          originUrl,
          webhookEndpoint,
        );
        const paymentIntentCreateDto = this.constructPaymentIntentDto(
          booking,
          callbackUrls,
        );

        const paymentIntentCreateResponse = await this.createPaymentIntent(
          paymentIntentCreateDto,
        );

        paymentReceive = await this.createPaymentReceive(
          booking,
          auditUserId,
          paymentIntentCreateResponse,
        );
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
      this.logger.error(error?.response?.data);

      this.logger.error("Error in getPaymentIntent:", error);
      throw new BadRequestException("Failed to get payment intent");
    }
  }

  async handleWebhookEvent(request: Request): Promise<void> {
    try {
      const authHeader = request.get("authorization");
      if (!authHeader || authHeader !== this.webhookSecret)
        throw new BadRequestException("Unauthorized access");

      const event: IPaymentWebhookEvent = request.body;
      if (!event) throw new BadRequestException("Invalid webhook payload");

      const { event: eventType, data } = event;
      switch (eventType) {
        case PaymentWebhookEventEnum.PaymentReservationFailed:
          await this.handlePaymentFailed(data);
          break;
        case PaymentWebhookEventEnum.PaymentChargeFailed:
          await this.handlePaymentFailed(data);
          break;
        case PaymentWebhookEventEnum.PaymentCheckoutCompleted:
          await this.handlePaymentCompleted(data);
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
      );
      throw new NotFoundException(
        `Booking with ID ${bookingId} not found or not eligible for payment.`,
      );
    }

    return booking;
  }

  private isInvalidForPG(url: string): boolean {
    if (!url) return true;

    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname.toLowerCase();

      return (
        parsedUrl.protocol !== "https:" ||
        hostname === "localhost" ||
        hostname === "[::1]" ||
        /^(127(?:\.\d{1,3}){3})$/.test(hostname)
      );
    } catch (_) {
      return true;
    }
  }

  private getCallbackUrls(
    hostUrl: string,
    originUrl: string,
    webhookEndpoint: string,
  ): ICallbackUrls {
    return {
      websiteCallbackUrl: this.isInvalidForPG(originUrl)
        ? this.staticWebsiteUrl
        : originUrl,
      webhookEventUrl: `${this.isInvalidForPG(hostUrl) ? this.staticServerUrl : hostUrl}${webhookEndpoint}`,
    };
  }

  private constructPaymentIntentDto(
    booking: CleaningBookingDocument,
    callbackUrls: ICallbackUrls,
  ): IPaymentIntentCreateDto {
    return {
      order: {
        items: [
          {
            reference: booking.id,
            name: `Reservation for cleaning on ${new Date(booking.cleaningDate).toDateString()}`,
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
        returnUrl: `${callbackUrls.websiteCallbackUrl}/redirect-payment`,
        termsUrl: `${callbackUrls.websiteCallbackUrl}/terms-and-conditions`,
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
          url: callbackUrls.webhookEventUrl,
          authorization: this.webhookSecret,
        })),
      },
    };
  }

  private async createPaymentIntent(
    paymentIntentCreateDto: IPaymentIntentCreateDto,
  ): Promise<{ paymentId: string; hostedPaymentPageUrl: string }> {
    const { data } = await this.paymentApiClient.post<{
      paymentId: string;
      hostedPaymentPageUrl: string;
    }>("/v1/payments", paymentIntentCreateDto);

    return data;
  }

  private async createPaymentReceive(
    booking: CleaningBookingDocument,
    auditUserId: string,
    paymentIntentCreateResponse: {
      paymentId: string;
      hostedPaymentPageUrl: string;
    },
  ): Promise<PaymentReceiveDocument> {
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
  private async handlePaymentFailed(
    data: IPaymentWebhookEventData,
  ): Promise<void> {
    await this.updateBookingAndPaymentStatus(
      data,
      CleaningBookingPaymentStatusEnum.PaymentFailed,
    );
  }

  private async handlePaymentCompleted(
    data: IPaymentWebhookEventData,
  ): Promise<void> {
    await this.updateBookingAndPaymentStatus(
      data,
      CleaningBookingPaymentStatusEnum.PaymentCompleted,
    );
  }

  private async updateBookingAndPaymentStatus(
    data: IPaymentWebhookEventData,
    paymentStatus: CleaningBookingPaymentStatusEnum,
  ): Promise<void> {
    const paymentReceive = await this.paymentReceiveRepository.getOneWhere({
      paymentIntentId: data.paymentId,
    });

    if (!paymentReceive) {
      this.logger.error("Invalid payment receive");
      throw new BadRequestException("Invalid payment receive");
    }

    const booking = await this.cleaningBookingRepository.getOneWhere({
      isActive: true,
      paymentReceive: paymentReceive.id,
    });

    if (!booking) {
      this.logger.error("Invalid booking for payment receive");
      throw new BadRequestException("Invalid booking for payment receive");
    }

    const paymentReceiveUpdate: UpdateQuery<PaymentReceiveDocument> = {
      lastPaymentEvent: JSON.stringify(data),
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
      paymentStatus,
    });
  }
  //#endregion
}
