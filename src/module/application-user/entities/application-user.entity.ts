import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model, Types } from "mongoose";
import { ImageMeta } from "../../image-meta/entities/image-meta.entity";
import { ApplicationUserRoleEnum } from "../enum/application-user-role.enum";

export type ApplicationUserDocument = HydratedDocument<ApplicationUser>;
export type ApplicationUserType = Model<ApplicationUserDocument>;

@Schema({
  toJSON: {
    transform: function (_, ret) {
      delete ret?.password;
      delete ret?.role;
      delete ret?.isPasswordLess;
    },
  },
})
export class ApplicationUser {
  @Prop({ required: true })
  email: string;

  @Prop({ default: "" })
  password: string;

  @Prop({ default: false })
  isPasswordLess: boolean;

  @Prop({
    type: String,
    enum: Object.values(ApplicationUserRoleEnum),
    default: ApplicationUserRoleEnum.USER,
  })
  role: ApplicationUserRoleEnum;

  @Prop({ default: null })
  fullName?: string;

  @Prop({ default: null })
  phoneNumber?: string;

  @Prop({ default: null })
  pidNumber?: string;

  @Prop({ default: null })
  address?: string;

  @Prop({ default: null })
  dateOfBirth?: Date;

  @Prop({ default: () => new Date() })
  dateJoined: Date;

  @Prop({ default: () => new Date() })
  lastLogin: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({
    type: Types.ObjectId,
    ref: ImageMeta.name,
    default: null,
  })
  profilePicture?: string;
}

export const ApplicationUserSchema =
  SchemaFactory.createForClass(ApplicationUser);

// Bind user email with role to be unique together
ApplicationUserSchema.index({ email: 1, role: 1 }, { unique: true });
