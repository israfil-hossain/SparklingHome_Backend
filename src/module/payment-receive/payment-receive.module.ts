import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CleaningBookingModule } from "../cleaning-booking/cleaning-booking.module";
import {
  PaymentEvent,
  PaymentEventSchema,
} from "./entities/payment-event.entity";
import {
  PaymentReceive,
  PaymentReceiveSchema,
} from "./entities/payment-receive.entity";
import { PaymentEventRepository } from "./payment-event.repository";
import { PaymentReceiveController } from "./payment-receive.controller";
import { PaymentReceiveRepository } from "./payment-receive.repository";
import { PaymentReceiveService } from "./payment-receive.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PaymentReceive.name, schema: PaymentReceiveSchema },
    ]),
    MongooseModule.forFeature([
      { name: PaymentEvent.name, schema: PaymentEventSchema },
    ]),
    CleaningBookingModule,
  ],
  controllers: [PaymentReceiveController],
  providers: [
    PaymentReceiveService,
    PaymentReceiveRepository,
    PaymentEventRepository,
  ],
  exports: [PaymentReceiveService],
})
export class PaymentReceiveModule {}
