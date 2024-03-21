import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model } from "mongoose";
import { CleaningSubscriptionFrequencyEnum } from "../../cleaning-subscription/enum/cleaning-subscription-frequency.enum";
import { BaseEntity } from "../../common/entities/base.entity";

@Schema()
export class CleaningPrice extends BaseEntity {
  @Prop({
    required: true,
    unique: true,
    type: String,
    enum: Object.values(CleaningSubscriptionFrequencyEnum),
    default: CleaningSubscriptionFrequencyEnum.WEEKLY,
  })
  subscriptionFrequency: CleaningSubscriptionFrequencyEnum;

  @Prop({ required: true, type: Number, min: 1 })
  subscriptionPrice: number;

  @Prop({ type: String, default: null })
  description: string;
}

export type CleaningPriceDocument = HydratedDocument<CleaningPrice>;
export type CleaningPriceType = Model<CleaningPriceDocument>;

export const CleaningPriceSchema = SchemaFactory.createForClass(CleaningPrice);
