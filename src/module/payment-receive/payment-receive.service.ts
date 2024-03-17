import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
  NotImplementedException,
  RawBodyRequest,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance } from "axios";
import { CleaningBookingRepository } from "../cleaning-booking/cleaning-booking.repository";
import { CleaningBookingPaymentStatusEnum } from "../cleaning-booking/enum/cleaning-booking-payment-status.enum";
import { CleaningBookingStatusEnum } from "../cleaning-booking/enum/cleaning-booking-status.enum";
import { SuccessResponseDto } from "../common/dto/success-response.dto";
import { PaymentIntentResponseDto } from "./dto/payment-intent-response.dto";
import { PaymentReceiveDocument } from "./entities/payment-receive.entity";
import { PaymentWebhookEventEnum } from "./enum/payment-webhook-event.enum";
import { PaymentReceiveRepository } from "./payment-receive.repository";

// interface StripeIntentMetadata extends Stripe.MetadataParam {
//   bookingCode: string;
//   bookingId: string;
//   paymentReceiveId: string;
// }

@Injectable()
export class PaymentReceiveService {
  private readonly logger: Logger = new Logger(PaymentReceiveService.name);
  private readonly paymentApiClient: AxiosInstance;
  private readonly webhookSecret: string;
  private readonly staticServerUrl: string;
  private readonly staticWebsiteUrl: string;

  constructor(
    private readonly configService: ConfigService,
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
      const booking = await this.cleaningBookingRepository.getOneById(
        bookingId,
        {
          populate: "paymentReceive",
        },
      );

      if (!booking) {
        this.logger.error(
          `Booking with ID ${bookingId} requested by ${auditUserId} was not found.`,
        );
        throw new NotFoundException(`Booking with ID ${bookingId} not found.`);
      }

      if (
        booking.bookingStatus === CleaningBookingStatusEnum.BookingCompleted &&
        booking.paymentStatus ===
          CleaningBookingPaymentStatusEnum.PaymentCompleted
      ) {
        this.logger.error(
          `Booking with ID ${bookingId} requested by ${auditUserId} is already paid.`,
        );
        throw new BadRequestException(
          "Payment already completed for this booking",
        );
      }

      let paymentReceive =
        booking?.paymentReceive as unknown as PaymentReceiveDocument;
      if (!paymentReceive) {
        const hostCallbackUrl = this.isInvalidForPG(hostUrl)
          ? this.staticServerUrl
          : hostUrl;

        const websiteCallbackUrl = this.isInvalidForPG(originUrl)
          ? this.staticWebsiteUrl
          : originUrl;

        const paymentIntentCreateDto = {
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
                // imageUrl: "string",
              },
            ],
            amount: booking.totalAmount * 100,
            currency: "SEK",
            reference: booking.id,
          },
          checkout: {
            integrationType: "HostedPaymentPage",
            returnUrl: `${websiteCallbackUrl}/redirect-payment`,
            termsUrl: `${websiteCallbackUrl}/terms-and-conditions`,
            charge: true,
            publicDevice: true,
            merchantHandlesConsumerData: true,
            appearance: {
              displayOptions: {
                showMerchantName: true,
                showOrderSummary: true,
              },
              textOptions: {
                completePaymentButtonText: "pay",
              },
            },
          },
          notifications: {
            webHooks: Object.values(PaymentWebhookEventEnum).map((value) => ({
              eventName: value,
              url: `${hostCallbackUrl}${webhookEndpoint}`,
              authorization: `Wid ${this.webhookSecret}`,
            })),
          },
        };

        const { data: paymentIntentCreateResponse } =
          await this.paymentApiClient.post<{
            paymentId: string;
            hostedPaymentPageUrl: string;
          }>("/v1/payments", paymentIntentCreateDto);

        paymentReceive = await this.paymentReceiveRepository.create({
          totalPayable: booking.totalAmount,
          totalDue: booking.totalAmount,
          paymentIntentId: paymentIntentCreateResponse.paymentId,
          paymentRedirectUrl: paymentIntentCreateResponse.hostedPaymentPageUrl,
          createdBy: auditUserId,
        });

        this.cleaningBookingRepository.updateOneById(bookingId, {
          paymentReceive: paymentReceive.id,
          paymentStatus: CleaningBookingPaymentStatusEnum.PaymentInitiated,
          updatedBy: auditUserId,
        });
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

      this.logger.error("Error in getPaymentIntent:", error);
      throw new BadRequestException("Failed to get payment intent");
    }
  }

  async handleWebhookEvent(
    request: RawBodyRequest<Request>,
    signature: string,
  ) {
    this.logger.log({ request, signature });
    // try {
    //   if (!this.stripeWebhookSecret) {
    //     throw new Error(
    //       "Stripe webhook secret not found in the configuration.",
    //     );
    //   }

    //   const event = this.stripeService.webhooks.constructEvent(
    //     request.rawBody as Buffer,
    //     signature,
    //     this.stripeWebhookSecret,
    //   );

    //   const bookingSpaceUpdates: UpdateQuery<SpaceBookingDocument> = {};
    //   const paymentReceiveUpdates: UpdateQuery<PaymentReceiveDocument> = {};

    //   // Handle the Stripe event based on its type
    //   switch (event.type) {
    //     case "payment_intent.created":
    //       bookingSpaceUpdates.bookingStatus =
    //         SpaceBookingStatusEnum.PaymentCreated;
    //       break;

    //     case "payment_intent.succeeded":
    //       bookingSpaceUpdates.bookingStatus =
    //         SpaceBookingStatusEnum.PaymentCompleted;

    //       const amountReceived = event.data?.object?.amount_received ?? 0;
    //       const totalAmount = event.data?.object?.amount ?? 0;

    //       if (isNaN(amountReceived) || isNaN(totalAmount)) {
    //         throw new Error("Invalid amount values in the Stripe event.");
    //       }

    //       paymentReceiveUpdates.totalPaid = parseFloat(
    //         (amountReceived / 100).toFixed(2),
    //       );
    //       paymentReceiveUpdates.totalDue = parseFloat(
    //         ((totalAmount - amountReceived) / 100).toFixed(2),
    //       );
    //       break;

    //     case "payment_intent.payment_failed":
    //       bookingSpaceUpdates.bookingStatus =
    //         SpaceBookingStatusEnum.PaymentFailed;
    //       break;

    //     default:
    //       this.logger.log("Unhandled event type: " + event.type);
    //   }

    //   const paymentIntent = event.data.object as Stripe.PaymentIntent;
    //   const intentMetadata = paymentIntent.metadata as StripeIntentMetadata;

    //   if (intentMetadata.paymentReceiveId) {
    //     paymentReceiveUpdates.lastPaymentEvent = JSON.stringify(
    //       event.data?.object,
    //     );

    //     await this.paymentReceiveRepository.updateOneById(
    //       intentMetadata.paymentReceiveId,
    //       paymentReceiveUpdates,
    //     );
    //   }

    //   if (
    //     intentMetadata.bookingId &&
    //     Object.keys(bookingSpaceUpdates).length > 0
    //   ) {
    //     await this.spaceBookingRepository.updateOneById(
    //       intentMetadata.bookingId,
    //       bookingSpaceUpdates,
    //     );
    //   }

    //   return { received: true };
    // } catch (error) {
    //   this.logger.error("Error handling Stripe webhook event:", error);
    //   throw new BadRequestException("Error in webhook event processing");
    // }

    throw new NotImplementedException("Method is not complete yet");
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
}
