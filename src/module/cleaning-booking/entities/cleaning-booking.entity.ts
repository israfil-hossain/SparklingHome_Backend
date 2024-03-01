import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model, Types } from "mongoose";
import { CleaningPrice } from "../../cleaning-price/entities/cleaning-price.entity";
import { BaseEntity } from "../../common/entities/base.entity";
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

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: CleaningPrice.name,
  })
  cleaningPrice: string;

  @Prop({ required: true, min: 1 })
  totalAmount: number;

  @Prop({ default: 0 })
  suppliesCharges: number;

  @Prop({ default: 0 })
  discountAmount: number;

  @Prop({ default: 0 })
  vatAmount: number;

  @Prop({
    type: String,
    enum: Object.values(CleaningBookingStatusEnum),
    default: CleaningBookingStatusEnum.BookingInitiated,
  })
  bookingStatus: CleaningBookingStatusEnum;
}

export const CleaningBookingSchema =
  SchemaFactory.createForClass(CleaningBooking);
