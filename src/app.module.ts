import { Module } from "@nestjs/common";
import { ApplicationUserModule } from "./module/application-user/application-user.module";
import { AuthenticationModule } from "./module/authentication/authentication.module";
import { CleaningSubscriptionModule } from "./module/cleaning-subscription/cleaning-subscription.module";
import { CommonModule } from "./module/common/common.module";
import { EmailModule } from "./module/email/email.module";
import { EncryptionModule } from "./module/encryption/encryption.module";
import { ImageMetaModule } from "./module/image-meta/image-meta.module";
import { ValidationProvider } from "./utility/provider/validation.provider";
import { CleaningBookingModule } from "./module/cleaning-booking/cleaning-booking.module";
import { CleaningTimeSlotModule } from "./module/cleaning-time-slot/cleaning-time-slot.module";
import { CleaningPriceModule } from "./module/cleaning-price/cleaning-price.module";

@Module({
  imports: [
    CommonModule,
    EmailModule,
    ImageMetaModule,
    EncryptionModule,
    AuthenticationModule,
    ApplicationUserModule,
    CleaningSubscriptionModule,
    CleaningBookingModule,
    CleaningTimeSlotModule,
    CleaningPriceModule,
  ],
  providers: [ValidationProvider],
})
export class AppModule {}
