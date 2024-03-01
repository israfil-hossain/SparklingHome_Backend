import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model, Types } from "mongoose";
import { ApplicationUser } from "../../application-user/entities/application-user.entity";
import { CleaningBooking } from "../../cleaning-booking/entities/cleaning-booking.entity";
import { CleaningPrice } from "../../cleaning-price/entities/cleaning-price.entity";
import { BaseEntity } from "../../common/entities/base.entity";

@Schema()
export class CleaningSubscription extends BaseEntity {
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: ApplicationUser.name,
  })
  subscribedUser: string;

  @Prop({ required: true, min: 1 })
  areaInSquareMeters: number;

  @Prop({ required: true, minlength: 5 })
  postalCode: number;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true, min: 1 })
  cleaningDurationInHours: number;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: CleaningPrice.name,
  })
  cleaningPrice: string;

  @Prop({ required: true, type: Date, min: new Date() })
  startDate: Date;

  @Prop({ default: false })
  hasCats: boolean;

  @Prop({ default: false })
  hasDogs: boolean;

  @Prop({ default: false })
  hasOtherPets: boolean;

  @Prop({ default: 0 })
  couponDiscount: number;

  @Prop({
    default: null,
    type: Types.ObjectId,
    ref: CleaningBooking.name,
  })
  currentBooking: string;
}

export type CleaningSubscriptionDocument =
  HydratedDocument<CleaningSubscription>;
export type CleaningSubscriptionType = Model<CleaningSubscriptionDocument>;

export const CleaningSubscriptionSchema =
  SchemaFactory.createForClass(CleaningSubscription);
