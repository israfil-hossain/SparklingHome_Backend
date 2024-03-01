import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model } from "mongoose";
import { BaseEntity } from "../../common/entities/base.entity";
import { CleaningSubscriptionFrequencyEnum } from "../enum/cleaning-subscription-frequency.enum";

@Schema()
export class CleaningSubscription extends BaseEntity {
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
    default: CleaningSubscriptionFrequencyEnum.WEEKLY,
  })
  subscriptionFrequency: CleaningSubscriptionFrequencyEnum;

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

  @Prop({ default: null })
  currentBooking: string;
}

export type CleaningSubscriptionDocument =
  HydratedDocument<CleaningSubscription>;
export type CleaningSubscriptionType = Model<CleaningSubscriptionDocument>;

export const CleaningSubscriptionSchema =
  SchemaFactory.createForClass(CleaningSubscription);
