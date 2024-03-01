import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model, Types } from "mongoose";
import { BaseEntity } from "../../common/entities/base.entity";
import { PaymentReceive } from "../../payment-receive/entities/payment-receive.entity";
import { CleaningBookingStatusEnum } from "../enum/cleaning-booking.enum";

export type CleaningBookingDocument = HydratedDocument<CleaningBooking>;
export type CleaningBookingType = Model<CleaningBookingDocument>;

@Schema()
export class CleaningBooking extends BaseEntity {
  @Prop({
    type: Date,
    required: true,
    min: new Date(),
  })
  cleaningDate: Date;

  @Prop({ required: true, min: 1 })
  cleaningDuration: number;

  @Prop({ required: true, min: 1 })
  cleaningPrice: number;

  @Prop({ required: true, min: 1 })
  suppliesCharges: number;

  @Prop({ required: true, min: 1 })
  discountAmount: number;

  @Prop({ required: true, min: 1 })
  totalAmount: number;

  @Prop({ required: true, min: 1 })
  vatAmount: number;

  @Prop({
    type: Types.ObjectId,
    ref: PaymentReceive.name,
    default: null,
  })
  paymentReceiveId?: string;

  @Prop({
    type: String,
    enum: Object.values(CleaningBookingStatusEnum),
    default: CleaningBookingStatusEnum.BookingInitiated,
  })
  bookingStatus: CleaningBookingStatusEnum;
}

export const CleaningBookingSchema =
  SchemaFactory.createForClass(CleaningBooking);
