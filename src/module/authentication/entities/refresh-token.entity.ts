import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model, Types } from "mongoose";
import { ApplicationUser } from "../../application-user/entities/application-user.entity";

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;
export type RefreshTokenType = Model<RefreshTokenDocument>;

@Schema({
  toJSON: {
    transform: function (_, ret) {
      delete ret?.token;
    },
  },
})
export class RefreshToken {
  @Prop({ type: String, required: true, unique: true })
  token: string;

  @Prop({
    type: Types.ObjectId,
    ref: ApplicationUser.name,
    required: true,
  })
  user: string;

  @Prop({
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    // Explanation: 30 days * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds
  })
  expiresAt: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
