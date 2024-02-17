import {
  Injectable,
  Logger,
  NotImplementedException,
  RawBodyRequest,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Stripe } from "stripe";
import { SuccessResponseDto } from "../common/dto/success-response.dto";
import { PaymentReceiveRepository } from "./payment-receive.repository";

// interface StripeIntentMetadata extends Stripe.MetadataParam {
//   bookingCode: string;
//   bookingId: string;
//   paymentReceiveId: string;
// }

@Injectable()
export class PaymentReceiveService {
  private readonly logger: Logger = new Logger(PaymentReceiveService.name);
  private readonly stripeService: Stripe;

  private readonly stripeWebhookSecret: string;
  private readonly stripePublishableKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly paymentReceiveRepository: PaymentReceiveRepository,
  ) {
    const stripeSecretKey = this.configService.get<string>(
      "STRIPE_SECRET_KEY",
      "",
    );
    this.stripePublishableKey = this.configService.get<string>(
      "STRIPE_PUBLISHABLE_KEY",
      "",
    );
    this.stripeWebhookSecret = this.configService.get<string>(
      "STRIPE_WEBHOOK_SECRET",
      "",
    );

    this.stripeService = new Stripe(stripeSecretKey, {});
  }

  async getPaymentIntent(
    bookingId: string,
    auditUserId: string,
  ): Promise<SuccessResponseDto> {
    this.logger.log({ bookingId, auditUserId });
    // try {
    //   const booking = await this.spaceBookingRepository.getOneById(bookingId, {
    //     populate: "paymentReceive",
    //   });

    //   if (!booking) {
    //     this.logger.error(
    //       `Booking with ID ${bookingId} requested by ${auditUserId} was not found.`,
    //     );
    //     throw new NotFoundException(`Booking with ID ${bookingId} not found.`);
    //   }

    //   if (
    //     booking.bookingStatus === SpaceBookingStatusEnum.PaymentCompleted ||
    //     booking.bookingStatus === SpaceBookingStatusEnum.BookingCompleted
    //   ) {
    //     this.logger.error(
    //       `Booking with ID ${bookingId} requested by ${auditUserId} is already completed.`,
    //     );
    //     throw new BadRequestException(
    //       "Payment already completed for this booking",
    //     );
    //   }

    //   let stripeIntent: Stripe.PaymentIntent;
    //   let paymentReceive =
    //     booking?.paymentReceive as unknown as PaymentReceiveDocument;

    //   if (!paymentReceive) {
    //     paymentReceive = await this.paymentReceiveRepository.create({
    //       totalPayable: booking.totalPrice,
    //       totalDue: booking.totalPrice,
    //       createdBy: auditUserId,
    //     });

    //     const intentMetadata: StripeIntentMetadata = {
    //       bookingCode: booking.bookingCode,
    //       bookingId: booking._id?.toString(),
    //       paymentReceiveId: paymentReceive._id?.toString(),
    //     };

    //     stripeIntent = await this.stripeService.paymentIntents.create({
    //       amount: booking.totalPrice * 100,
    //       currency: "usd",
    //       metadata: intentMetadata,
    //     });

    //     await this.paymentReceiveRepository.updateOneById(paymentReceive.id, {
    //       paymentIntentId: stripeIntent.id,
    //       lastPaymentEvent: JSON.stringify(stripeIntent),
    //       updatedBy: auditUserId,
    //     });

    //     await this.spaceBookingRepository.updateOneById(bookingId, {
    //       paymentReceive: paymentReceive._id?.toString(),
    //       bookingStatus: SpaceBookingStatusEnum.PaymentInitiated,
    //       updatedBy: auditUserId,
    //     });
    //   } else {
    //     stripeIntent = await this.stripeService.paymentIntents.retrieve(
    //       paymentReceive?.paymentIntentId,
    //     );
    //   }

    //   const paymentIntentResponse = new PaymentIntentResponseDto();
    //   paymentIntentResponse.bookingCode = booking.bookingCode;
    //   paymentIntentResponse.bookingPrice = paymentReceive.totalPayable;
    //   paymentIntentResponse.stipeKey = this.stripePublishableKey;
    //   paymentIntentResponse.stripeSecret = stripeIntent.client_secret || "";
    //   paymentIntentResponse.status = stripeIntent.status;
    //   paymentIntentResponse.currency = stripeIntent.currency;

    //   return new SuccessResponseDto(
    //     "Payment intent retrieved successfully",
    //     paymentIntentResponse,
    //   );
    // } catch (error) {
    //   if (error instanceof HttpException) throw error;

    //   this.logger.error("Error in getPaymentIntent:", error);
    //   throw new BadRequestException("Failed to get payment intent");
    // }

    throw new NotImplementedException("Method is not complete yet");
  }

  async handleStripeWebhook(
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

  //#region Internal helper methods
  //#endregion
}
