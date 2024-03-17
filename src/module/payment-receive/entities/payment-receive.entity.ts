import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model } from "mongoose";
import { BaseEntity } from "../../common/entities/base.entity";

export type PaymentReceiveDocument = HydratedDocument<PaymentReceive>;
export type PaymentReceiveType = Model<PaymentReceiveDocument>;

@Schema()
export class PaymentReceive extends BaseEntity {
  @Prop({ type: Number, required: true })
  totalPayable: number;

  @Prop({ type: Number, required: true })
  totalDue: number;

  @Prop({ type: Number, default: 0 })
  totalPaid: number;

  @Prop({ type: String })
  paymentIntentId: string;

  @Prop({ type: String })
  paymentRedirectUrl: string;

  @Prop({ type: String })
  lastPaymentEvent: string;
}

export const PaymentReceiveSchema =
  SchemaFactory.createForClass(PaymentReceive);
