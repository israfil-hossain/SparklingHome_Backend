import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CleaningBookingModule } from "../cleaning-booking/cleaning-booking.module";
import {
  PaymentReceive,
  PaymentReceiveSchema,
} from "./entities/payment-receive.entity";
import { PaymentReceiveController } from "./payment-receive.controller";
import { PaymentReceiveRepository } from "./payment-receive.repository";
import { PaymentReceiveService } from "./payment-receive.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PaymentReceive.name, schema: PaymentReceiveSchema },
    ]),
    CleaningBookingModule,
  ],
  controllers: [PaymentReceiveController],
  providers: [PaymentReceiveService, PaymentReceiveRepository],
  exports: [PaymentReceiveRepository],
})
export class PaymentReceiveModule {}
