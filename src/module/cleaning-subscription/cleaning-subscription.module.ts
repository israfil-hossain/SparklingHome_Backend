import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ApplicationUserModule } from "../application-user/application-user.module";
import { CleaningBookingModule } from "../cleaning-booking/cleaning-booking.module";
import { CleaningCouponModule } from "../cleaning-coupon/cleaning-coupon.module";
import { CleaningPriceModule } from "../cleaning-price/cleaning-price.module";
import { ConfigurationModule } from "../configuration/configuration.module";
import { EncryptionModule } from "../encryption/encryption.module";
import { PaymentReceiveModule } from "../payment-receive/payment-receive.module";
import { CleaningSubscriptionController } from "./cleaning-subscription.controller";
import { CleaningSubscriptionRepository } from "./cleaning-subscription.repository";
import { CleaningSubscriptionService } from "./cleaning-subscription.service";
import {
  CleaningSubscription,
  CleaningSubscriptionSchema,
} from "./entities/cleaning-subscription.entity";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CleaningSubscription.name, schema: CleaningSubscriptionSchema },
    ]),
    CleaningPriceModule,
    CleaningBookingModule,
    CleaningCouponModule,
    PaymentReceiveModule,
    ConfigurationModule,
    ApplicationUserModule,
    EncryptionModule,
  ],
  controllers: [CleaningSubscriptionController],
  providers: [CleaningSubscriptionService, CleaningSubscriptionRepository],
})
export class CleaningSubscriptionModule {}
