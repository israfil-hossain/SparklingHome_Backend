import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model } from "mongoose";
import { BaseEntity } from "../../common/entities/base.entity";

@Schema()
export class CleaningCoupon extends BaseEntity {
  @Prop({ type: String, required: true, trim: true, unique: true })
  couponCode: string;

  @Prop({ type: Number, required: true, min: 0, max: 100 })
  discountPercentage: number;

  @Prop({ type: Number, required: true, min: 0 })
  maximumDiscount: number;
}

export type CleaningCouponDocument = HydratedDocument<CleaningCoupon>;
export type CleaningCouponType = Model<CleaningCouponDocument>;

export const CleaningCouponSchema =
  SchemaFactory.createForClass(CleaningCoupon);
