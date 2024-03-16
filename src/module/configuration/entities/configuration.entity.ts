import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model } from "mongoose";
import { BaseEntity } from "../../common/entities/base.entity";

export type ConfigurationDocument = HydratedDocument<Configuration>;
export type ConfigurationType = Model<ConfigurationDocument>;

@Schema()
export class Configuration extends BaseEntity {
  @Prop({ required: true, default: 0, min: 0 })
  suppliesCharge: number;
}

export const ConfigurationSchema = SchemaFactory.createForClass(Configuration);
