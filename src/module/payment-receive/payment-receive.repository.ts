import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { GenericRepository } from "../common/repository/generic-repository";
import {
  PaymentReceive,
  PaymentReceiveDocument,
  PaymentReceiveType,
} from "./entities/payment-receive.entity";

@Injectable()
export class PaymentReceiveRepository extends GenericRepository<PaymentReceiveDocument> {
  constructor(
    @InjectModel(PaymentReceive.name)
    private model: PaymentReceiveType,
  ) {
    super(model, new Logger(PaymentReceiveRepository.name));
  }
}
