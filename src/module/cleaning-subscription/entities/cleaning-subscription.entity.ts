import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model, Types } from "mongoose";
import { ApplicationUser } from "../../application-user/entities/application-user.entity";
import { CleaningBooking } from "../../cleaning-booking/entities/cleaning-booking.entity";
import { CleaningCoupon } from "../../cleaning-coupon/entities/cleaning-coupon.entity";
import { BaseEntity } from "../../common/entities/base.entity";
import { CleaningSubscriptionFrequencyEnum } from "../enum/cleaning-subscription-frequency.enum";

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
    type: String,
    enum: Object.values(CleaningSubscriptionFrequencyEnum),
  })
  subscriptionFrequency: CleaningSubscriptionFrequencyEnum;

  @Prop({
    default: null,
    type: Types.ObjectId,
    ref: CleaningCoupon.name,
  })
  cleaningCoupon: string;

  @Prop({ required: true, type: Date, min: new Date() })
  startDate: Date;

  @Prop({
    type: Date,
    min: new Date(),
    default: null,
  })
  nextScheduleDate: Date | null;

  @Prop({ default: false })
  hasCats: boolean;

  @Prop({ default: false })
  hasDogs: boolean;

  @Prop({ default: false })
  hasOtherPets: boolean;

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
