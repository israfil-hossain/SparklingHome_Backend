import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { GenericRepository } from "../common/repository/generic-repository";
import {
  PaymentEvent,
  PaymentEventDocument,
  PaymentEventType,
} from "./entities/payment-event.entity";

@Injectable()
export class PaymentEventRepository extends GenericRepository<PaymentEventDocument> {
  constructor(
    @InjectModel(PaymentEvent.name)
    private model: PaymentEventType,
  ) {
    super(model, new Logger(PaymentEventRepository.name));
  }
}
