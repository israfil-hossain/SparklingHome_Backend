import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model } from "mongoose";

export type PaymentEventDocument = HydratedDocument<PaymentEvent>;
export type PaymentEventType = Model<PaymentEventDocument>;

@Schema()
export class PaymentEvent {
  @Prop({ type: String, required: true })
  eventData: string;

  @Prop({ type: Date, default: Date.now })
  receivedAt: Date;
}

export const PaymentEventSchema = SchemaFactory.createForClass(PaymentEvent);
