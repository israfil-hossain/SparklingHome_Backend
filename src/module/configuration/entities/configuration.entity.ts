import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model } from "mongoose";
import { BaseEntity } from "../../common/entities/base.entity";

export type ConfigurationDocument = HydratedDocument<Configuration>;
export type ConfigurationType = Model<ConfigurationDocument>;

@Schema()
export class Configuration extends BaseEntity {
  @Prop({ required: true, default: 0, min: 0, max: 100 })
  ownerCommission: number;

  @Prop({ required: true, default: 0, min: 0, max: 100 })
  renterCommission: number;
}

export const ConfigurationSchema = SchemaFactory.createForClass(Configuration);
