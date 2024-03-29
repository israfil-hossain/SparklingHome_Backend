import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model, Types } from "mongoose";
import { ApplicationUser } from "../../application-user/entities/application-user.entity";
import { BaseEntity } from "../../common/entities/base.entity";
import { PaymentReceive } from "../../payment-receive/entities/payment-receive.entity";
import { CleaningBookingPaymentStatusEnum } from "../enum/cleaning-booking-payment-status.enum";
import { CleaningBookingStatusEnum } from "../enum/cleaning-booking-status.enum";

export type CleaningBookingDocument = HydratedDocument<CleaningBooking>;
export type CleaningBookingType = Model<CleaningBookingDocument>;

@Schema({
  toJSON: {
    transform: function (_, ret) {
      delete ret?.paymentReceive;
    },
  },
})
export class CleaningBooking extends BaseEntity {
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: ApplicationUser.name,
  })
  bookingUser: string;

  @Prop({ type: Number, required: true, min: 1 })
  subscriptionPrice: number;

  @Prop({
    type: Date,
    required: true,
    min: new Date(),
  })
  cleaningDate: Date;

  @Prop({ required: true, min: 1 })
  cleaningDuration: number;

  @Prop({ type: Number, required: true, min: 1 })
  cleaningPrice: number;

  @Prop({ type: Number, default: 0 })
  suppliesCharges: number;

  @Prop({ type: Number, default: 0 })
  discountAmount: number;

  @Prop({ type: Number, default: 0 })
  vatAmount: number;

  @Prop({ type: Number, default: 0 })
  additionalCharges: number;

  @Prop({ type: Number, required: true, min: 1 })
  totalAmount: number;

  @Prop({ type: String, default: null })
  remarks: string;

  @Prop({
    type: String,
    enum: Object.values(CleaningBookingStatusEnum),
    default: CleaningBookingStatusEnum.BookingInitiated,
  })
  bookingStatus: CleaningBookingStatusEnum;

  @Prop({
    type: String,
    enum: Object.values(CleaningBookingPaymentStatusEnum),
    default: CleaningBookingPaymentStatusEnum.PaymentPending,
  })
  paymentStatus: CleaningBookingPaymentStatusEnum;

  @Prop({
    type: Types.ObjectId,
    ref: PaymentReceive.name,
    default: null,
  })
  paymentReceive: string | null;
}

export const CleaningBookingSchema =
  SchemaFactory.createForClass(CleaningBooking);
