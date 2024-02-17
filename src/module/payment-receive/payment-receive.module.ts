import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
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
  ],
  controllers: [PaymentReceiveController],
  providers: [PaymentReceiveService, PaymentReceiveRepository],
})
export class PaymentReceiveModule {}
