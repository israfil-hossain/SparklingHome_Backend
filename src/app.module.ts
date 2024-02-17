import { Module } from "@nestjs/common";
import { ApplicationUserModule } from "./module/application-user/application-user.module";
import { AuthenticationModule } from "./module/authentication/authentication.module";
import { CommonModule } from "./module/common/common.module";
import { ConfigurationModule } from "./module/configuration/configuration.module";
import { EmailModule } from "./module/email/email.module";
import { EncryptionModule } from "./module/encryption/encryption.module";
import { ImageMetaModule } from "./module/image-meta/image-meta.module";
import { PaymentReceiveModule } from "./module/payment-receive/payment-receive.module";
import { ValidationProvider } from "./utility/provider/validation.provider";

@Module({
  imports: [
    CommonModule,
    EmailModule,
    ImageMetaModule,
    EncryptionModule,
    AuthenticationModule,
    ApplicationUserModule,
    ConfigurationModule,
    PaymentReceiveModule,
  ],
  providers: [ValidationProvider],
})
export class AppModule {}
